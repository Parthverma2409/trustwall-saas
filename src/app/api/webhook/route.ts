import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { getPlanFromPriceId } from '@/lib/stripe-prices'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  // If webhook secret is configured, verify signature
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event: Stripe.Event

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } else {
      // In development without webhook secret, parse directly
      event = JSON.parse(body) as Stripe.Event
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const subscriptionId = session.subscription as string

        if (!userId) break

        // Get the subscription to find the price
        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = sub.items.data[0]?.price.id || ''
        const plan = session.metadata?.plan || getPlanFromPriceId(priceId)

        await db.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubId: subscriptionId,
            stripePriceId: priceId,
            status: 'active',
            plan,
          },
          update: {
            stripeSubId: subscriptionId,
            stripePriceId: priceId,
            status: 'active',
            plan,
          },
        })
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        const priceId = sub.items.data[0]?.price.id || ''
        const plan = getPlanFromPriceId(priceId)

        const dbSub = await db.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        })
        if (!dbSub) break

        await db.subscription.update({
          where: { userId: dbSub.userId },
          data: {
            stripePriceId: priceId,
            status: sub.status === 'active' ? 'active' : 'cancelled',
            plan: sub.status === 'active' ? plan : 'free',
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string

        const dbSub = await db.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        })
        if (!dbSub) break

        await db.subscription.update({
          where: { userId: dbSub.userId },
          data: {
            status: 'cancelled',
            plan: 'free',
          },
        })
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
