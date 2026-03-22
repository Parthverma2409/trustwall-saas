import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const theme = searchParams.get('theme') || 'light'

  if (!id) {
    return new Response('Missing id', { status: 400 })
  }

  const testimonial = await db.testimonial.findUnique({
    where: { id },
    include: { space: { select: { name: true, primaryColor: true } } },
  })

  if (!testimonial || testimonial.status !== 'approved') {
    return new Response('Not found', { status: 404 })
  }

  const color = testimonial.space.primaryColor || '#6366f1'
  const isDark = theme === 'dark'
  const bg = isDark ? '#0f172a' : '#ffffff'
  const textColor = isDark ? '#f1f5f9' : '#1e293b'
  const mutedColor = isDark ? '#94a3b8' : '#64748b'
  const cardBg = isDark ? '#1e293b' : '#f8fafc'

  const stars = '★'.repeat(testimonial.rating) + '☆'.repeat(5 - testimonial.rating)
  const text = testimonial.text.length > 200
    ? testimonial.text.substring(0, 200) + '...'
    : testimonial.text

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg,
          fontFamily: 'system-ui, sans-serif',
          padding: '60px',
        }}
      >
        {/* Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: cardBg,
            borderRadius: '24px',
            padding: '48px 56px',
            maxWidth: '1000px',
            width: '100%',
            border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          }}
        >
          {/* Stars */}
          <div style={{ fontSize: '32px', color, marginBottom: '24px', display: 'flex' }}>
            {stars}
          </div>

          {/* Quote */}
          <div
            style={{
              fontSize: '28px',
              color: textColor,
              textAlign: 'center',
              lineHeight: 1.5,
              marginBottom: '32px',
              fontStyle: 'italic',
              display: 'flex',
            }}
          >
            &ldquo;{text}&rdquo;
          </div>

          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Avatar */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '20px',
                fontWeight: 700,
              }}
            >
              {testimonial.authorName.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '20px', fontWeight: 700, color: textColor }}>
                {testimonial.authorName}
              </span>
              {testimonial.authorTitle && (
                <span style={{ fontSize: '16px', color: mutedColor }}>
                  {testimonial.authorTitle}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '24px',
            fontSize: '16px',
            color: mutedColor,
          }}
        >
          Collected with <span style={{ fontWeight: 700, color }}> Trustwall</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
