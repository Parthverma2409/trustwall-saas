import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { STRIPE_PRICES } from '@/lib/stripe-prices'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json()
  const priceId = STRIPE_PRICES[plan]

  if (!priceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  // Get or create subscription record
  let sub = await db.subscription.findUnique({ where: { userId } })
  let customerId = sub?.stripeCustomerId

  // Create Stripe customer if needed
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { userId },
    })
    customerId = customer.id

    if (sub) {
      await db.subscription.update({
        where: { userId },
        data: { stripeCustomerId: customerId },
      })
    } else {
      await db.subscription.create({
        data: { userId, stripeCustomerId: customerId },
      })
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?success=true`,
    cancel_url: `${appUrl}/dashboard/billing?cancelled=true`,
    metadata: { userId, plan },
  })

  return NextResponse.json({ url: session.url })
}
