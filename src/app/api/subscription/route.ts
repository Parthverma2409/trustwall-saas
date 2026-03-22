import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { getPlanFromPriceId } from '@/lib/stripe-prices'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sync = req.nextUrl.searchParams.get('sync')
  let sub = await db.subscription.findUnique({ where: { userId } })

  // If sync=true and user has a Stripe customer, check Stripe for actual status
  if (sync && sub?.stripeCustomerId) {
    try {
      const subscriptions = await getStripe().subscriptions.list({
        customer: sub.stripeCustomerId,
        status: 'active',
        limit: 1,
      })

      if (subscriptions.data.length > 0) {
        const stripeSub = subscriptions.data[0]
        const priceId = stripeSub.items.data[0]?.price.id || ''
        const plan = getPlanFromPriceId(priceId)

        if (plan !== 'free' && (sub.plan !== plan || sub.status !== 'active')) {
          sub = await db.subscription.update({
            where: { userId },
            data: {
              stripeSubId: stripeSub.id,
              stripePriceId: priceId,
              status: 'active',
              plan,
            },
          })
        }
      } else {
        // No active subscription in Stripe
        if (sub.plan !== 'free' && sub.status !== 'free') {
          sub = await db.subscription.update({
            where: { userId },
            data: { status: 'cancelled', plan: 'free' },
          })
        }
      }
    } catch (err) {
      console.error('Stripe sync error:', err)
    }
  }

  return NextResponse.json({
    plan: sub?.plan || 'free',
    status: sub?.status || 'free',
  })
}
