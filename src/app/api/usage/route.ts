import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { getPlan } from '@/lib/plans'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sub = await db.subscription.findUnique({ where: { userId } })
  const plan = getPlan(sub?.plan || 'free')
  const planKey = sub?.plan || 'free'

  const spaces = await db.space.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      _count: { select: { testimonials: true } },
    },
  })

  const totalTestimonials = spaces.reduce((sum, s) => sum + s._count.testimonials, 0)

  return NextResponse.json({
    plan: planKey,
    spaces: {
      used: spaces.length,
      limit: plan.maxSpaces,
      percentage: plan.maxSpaces === Infinity ? 0 : Math.round((spaces.length / plan.maxSpaces) * 100),
    },
    testimonials: {
      total: totalTestimonials,
      limitPerSpace: plan.maxTestimonialsPerSpace,
      spaces: spaces.map(s => ({
        id: s.id,
        name: s.name,
        used: s._count.testimonials,
        limit: plan.maxTestimonialsPerSpace,
        percentage: plan.maxTestimonialsPerSpace === Infinity ? 0 : Math.round((s._count.testimonials / plan.maxTestimonialsPerSpace) * 100),
      })),
    },
    features: {
      removeBranding: plan.removeBranding,
      customCss: plan.customCss,
      csvImport: plan.csvImport,
      widgetStyles: plan.widgetStyles.length,
    },
  })
}
