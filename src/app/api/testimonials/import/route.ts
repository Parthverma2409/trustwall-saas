import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { getPlan } from '@/lib/plans'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check plan allows CSV import
  const sub = await db.subscription.findUnique({ where: { userId } })
  const plan = getPlan(sub?.plan || 'free')
  if (!plan.csvImport) {
    return NextResponse.json({ error: 'CSV import requires Pro plan' }, { status: 403 })
  }

  try {
    const { spaceId, rows } = await req.json()

    if (!spaceId || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'spaceId and rows are required' }, { status: 400 })
    }

    // Verify space ownership
    const space = await db.space.findUnique({ where: { id: spaceId } })
    if (!space || space.userId !== userId) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    }

    // Validate and insert rows (max 500 at a time)
    const validRows = rows.slice(0, 500).filter(
      (r: any) => r.authorName && r.text
    )

    if (validRows.length === 0) {
      return NextResponse.json({ error: 'No valid rows found. Each row needs at least authorName and text.' }, { status: 400 })
    }

    const created = await db.testimonial.createMany({
      data: validRows.map((r: any) => ({
        spaceId,
        authorName: String(r.authorName).substring(0, 200),
        authorEmail: r.authorEmail ? String(r.authorEmail).substring(0, 200) : null,
        authorTitle: r.authorTitle ? String(r.authorTitle).substring(0, 200) : null,
        text: String(r.text).substring(0, 2000),
        rating: Math.min(5, Math.max(1, parseInt(r.rating) || 5)),
        status: 'approved',
      })),
    })

    return NextResponse.json({ success: true, imported: created.count })
  } catch (error) {
    console.error('CSV import error:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
