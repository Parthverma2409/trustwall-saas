import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { submitTestimonialSchema } from '@/lib/validations'
import { canAddTestimonial } from '@/lib/plans'
import { detectLanguage } from '@/lib/detect-language'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { spaceId, ...data } = body

    if (!spaceId) {
      return NextResponse.json({ error: 'Space ID required' }, { status: 400 })
    }

    const validated = submitTestimonialSchema.parse(data)

    // Check space exists and get owner
    const space = await db.space.findUnique({ where: { id: spaceId } })
    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    }

    // Check plan limits
    const sub = await db.subscription.findUnique({ where: { userId: space.userId } })
    const plan = sub?.plan || 'free'
    const currentCount = await db.testimonial.count({ where: { spaceId } })
    if (!canAddTestimonial(plan, currentCount)) {
      return NextResponse.json({ error: 'This space has reached its testimonial limit.' }, { status: 403 })
    }

    // Determine status based on auto-approve rules
    let status = 'pending'
    if (space.autoApprove) {
      const minRating = space.autoApproveMinRating ?? 1
      if (validated.rating >= minRating) {
        status = 'approved'
      }
    }

    // Detect language
    const detected = detectLanguage(validated.text)

    const testimonial = await db.testimonial.create({
      data: {
        spaceId,
        authorName: validated.authorName,
        authorEmail: validated.authorEmail || null,
        authorTitle: validated.authorTitle || null,
        companyLogo: validated.companyLogo || null,
        socialLink: validated.socialLink || null,
        videoUrl: validated.videoUrl || null,
        text: validated.text,
        rating: validated.rating,
        status,
        language: detected.code,
      },
    })

    return NextResponse.json({ success: true, id: testimonial.id })
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    console.error('Submit testimonial error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
