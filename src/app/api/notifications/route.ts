import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get pending testimonials across all user's spaces (newest first)
  const pending = await db.testimonial.findMany({
    where: {
      space: { userId },
      status: 'pending',
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      authorName: true,
      text: true,
      createdAt: true,
      space: {
        select: { id: true, name: true },
      },
    },
  })

  return NextResponse.json({
    count: pending.length,
    items: pending.map(t => ({
      id: t.id,
      authorName: t.authorName,
      preview: t.text.substring(0, 80) + (t.text.length > 80 ? '...' : ''),
      spaceName: t.space.name,
      spaceId: t.space.id,
      createdAt: t.createdAt,
    })),
  })
}
