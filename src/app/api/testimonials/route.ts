import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { updateTestimonialSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const spaceId = searchParams.get('spaceId')
  if (!spaceId) return NextResponse.json({ error: 'spaceId required' }, { status: 400 })

  // Verify space ownership
  const space = await db.space.findFirst({ where: { id: spaceId, userId } })
  if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const status = searchParams.get('status')
  const tag = searchParams.get('tag')
  const lang = searchParams.get('lang')
  const testimonials = await db.testimonial.findMany({
    where: {
      spaceId,
      ...(status ? { status } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
      ...(lang ? { language: lang } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(testimonials)
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { id, ...data } = body

    if (!id) return NextResponse.json({ error: 'Testimonial id required' }, { status: 400 })

    const validated = updateTestimonialSchema.parse(data)

    // Verify ownership through space
    const testimonial = await db.testimonial.findUnique({
      where: { id },
      include: { space: { select: { userId: true } } },
    })
    if (!testimonial || testimonial.space.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updated = await db.testimonial.update({
      where: { id },
      data: validated,
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const testimonial = await db.testimonial.findUnique({
    where: { id },
    include: { space: { select: { userId: true } } },
  })
  if (!testimonial || testimonial.space.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.testimonial.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
