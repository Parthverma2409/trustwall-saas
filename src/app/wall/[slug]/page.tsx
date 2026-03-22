import { db } from '@/lib/db'
import { Star } from 'lucide-react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getEmbedUrl } from '@/lib/video-embed'

export const dynamic = 'force-dynamic'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const space = await db.space.findUnique({
    where: { slug: params.slug },
    select: { name: true },
  })
  if (!space) return {}
  return {
    title: `${space.name} — Wall of Love | Trustwall`,
    description: `See what people are saying about ${space.name}. Real testimonials from real customers.`,
    openGraph: {
      title: `${space.name} — Wall of Love`,
      description: `See what people are saying about ${space.name}.`,
    },
  }
}

export default async function WallOfLovePage({ params }: Props) {
  const space = await db.space.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      primaryColor: true,
      testimonials: {
        where: { status: 'approved' },
        orderBy: [{ isFavorite: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          authorName: true,
          authorTitle: true,
          text: true,
          rating: true,
          videoUrl: true,
          aiSummary: true,
          createdAt: true,
        },
      },
    },
  })

  if (!space) notFound()

  const avgRating = space.testimonials.length > 0
    ? (space.testimonials.reduce((sum, t) => sum + t.rating, 0) / space.testimonials.length).toFixed(1)
    : '0'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50" style={{ fontFamily: "'Open Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="text-center pt-16 pb-12 px-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-5 shadow-lg"
          style={{ backgroundColor: space.primaryColor }}
        >
          {space.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {space.name}
        </h1>
        <p className="text-slate-500 text-sm mb-4">Wall of Love</p>

        {space.testimonials.length > 0 && (
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-full px-5 py-2.5 shadow-sm">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${s <= Math.round(Number(avgRating)) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-900">{avgRating}</span>
            <span className="text-xs text-slate-400">from {space.testimonials.length} review{space.testimonials.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Testimonials Grid */}
      {space.testimonials.length === 0 ? (
        <div className="text-center py-20 px-6">
          <p className="text-slate-400">No testimonials yet.</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-6 pb-16 columns-1 sm:columns-2 lg:columns-3 gap-5">
          {space.testimonials.map((t) => {
            const embedUrl = t.videoUrl ? getEmbedUrl(t.videoUrl) : null
            return (
              <div
                key={t.id}
                className="break-inside-avoid mb-5 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
                {t.aiSummary && (
                  <p className="text-xs font-medium text-violet-600 mb-2 italic">{t.aiSummary}</p>
                )}
                <p className="text-slate-700 text-sm leading-relaxed mb-4">
                  &ldquo;{t.text}&rdquo;
                </p>
                {embedUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-slate-200/60">
                    <iframe
                      src={embedUrl}
                      className="w-full aspect-video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: space.primaryColor }}
                  >
                    {t.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.authorName}</p>
                    {t.authorTitle && <p className="text-xs text-slate-400">{t.authorTitle}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer — Powered by Trustwall */}
      <div className="text-center pb-10">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          Powered by <span className="font-bold"><span className="text-blue-600">Trust</span>wall</span>
        </a>
      </div>
    </div>
  )
}
