import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { createSpaceSchema } from '@/lib/validations'
import { canCreateSpace } from '@/lib/plans'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const spaces = await db.space.findMany({
    where: { userId },
    include: { _count: { select: { testimonials: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(spaces)
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const validated = createSpaceSchema.parse(body)

    // Check slug uniqueness
    const existing = await db.space.findUnique({ where: { slug: validated.slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug already taken' }, { status: 409 })
    }

    // Check plan limits
    const sub = await db.subscription.findUnique({ where: { userId } })
    const plan = sub?.plan || 'free'
    const count = await db.space.count({ where: { userId } })
    if (!canCreateSpace(plan, count)) {
      return NextResponse.json({ error: 'Space limit reached. Upgrade your plan.' }, { status: 403 })
    }

    const space = await db.space.create({
      data: {
        userId,
        name: validated.name,
        slug: validated.slug,
        logo: validated.logo || null,
        primaryColor: validated.primaryColor,
        thankYouMsg: validated.thankYouMsg,
      },
    })

    return NextResponse.json(space, { status: 201 })
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    console.error('Create space error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
