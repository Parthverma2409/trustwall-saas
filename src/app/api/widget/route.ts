import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getPlan } from '@/lib/plans'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const spaceId = searchParams.get('spaceId')

  if (!spaceId) {
    return NextResponse.json({ error: 'spaceId required' }, { status: 400 })
  }

  const space = await db.space.findUnique({
    where: { id: spaceId },
    select: {
      name: true,
      primaryColor: true,
      userId: true,
      testimonials: {
        where: { status: 'approved' },
        orderBy: [{ isFavorite: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          authorName: true,
          authorTitle: true,
          text: true,
          rating: true,
        },
      },
    },
  })

  if (!space) {
    return NextResponse.json({ error: 'Space not found' }, { status: 404 })
  }

  // Check owner's plan for branding
  const sub = await db.subscription.findUnique({ where: { userId: space.userId } })
  const plan = getPlan(sub?.plan || 'free')

  // Calculate aggregate rating
  const totalRating = space.testimonials.reduce((sum, t) => sum + t.rating, 0)
  const avgRating = space.testimonials.length > 0
    ? (totalRating / space.testimonials.length).toFixed(1)
    : '0'

  return NextResponse.json({
    name: space.name,
    primaryColor: space.primaryColor,
    testimonials: space.testimonials,
    removeBranding: plan.removeBranding,
    allowedStyles: plan.widgetStyles,
    aggregate: {
      average: avgRating,
      count: space.testimonials.length,
    },
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
