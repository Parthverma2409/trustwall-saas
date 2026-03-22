import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

interface RouteParams {
  params: { spaceId: string }
}

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const space = await db.space.findFirst({
    where: { id: params.spaceId, userId },
    include: { _count: { select: { testimonials: true } } },
  })

  if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(space)
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const space = await db.space.findFirst({ where: { id: params.spaceId, userId } })
  if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const updated = await db.space.update({
    where: { id: params.spaceId },
    data: {
      name: body.name ?? space.name,
      logo: body.logo ?? space.logo,
      primaryColor: body.primaryColor ?? space.primaryColor,
      thankYouMsg: body.thankYouMsg ?? space.thankYouMsg,
      thankYouRedirect: body.thankYouRedirect !== undefined ? (body.thankYouRedirect || null) : space.thankYouRedirect,
      autoApprove: body.autoApprove !== undefined ? body.autoApprove : space.autoApprove,
      autoApproveMinRating: body.autoApproveMinRating !== undefined ? (body.autoApproveMinRating || null) : space.autoApproveMinRating,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const space = await db.space.findFirst({ where: { id: params.spaceId, userId } })
  if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.space.delete({ where: { id: params.spaceId } })
  return NextResponse.json({ success: true })
}
