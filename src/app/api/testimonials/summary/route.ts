import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { generateSummary } from '@/lib/ai-summary'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Testimonial id required' }, { status: 400 })

  const testimonial = await db.testimonial.findUnique({
    where: { id },
    include: { space: { select: { userId: true } } },
  })

  if (!testimonial || testimonial.space.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const summary = generateSummary(testimonial.text)

  const updated = await db.testimonial.update({
    where: { id },
    data: { aiSummary: summary },
  })

  return NextResponse.json({ summary: updated.aiSummary })
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, summary } = await req.json()
  if (!id) return NextResponse.json({ error: 'Testimonial id required' }, { status: 400 })

  const testimonial = await db.testimonial.findUnique({
    where: { id },
    include: { space: { select: { userId: true } } },
  })

  if (!testimonial || testimonial.space.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await db.testimonial.update({
    where: { id },
    data: { aiSummary: summary || null },
  })

  return NextResponse.json({ summary: updated.aiSummary })
}
