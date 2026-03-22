'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { LayoutGrid, GalleryHorizontal, List, Copy, Check, ArrowLeft, Lock, Crown, Star } from 'lucide-react'
import { PLAN_DETAILS, type PlanKey } from '@/lib/plans'

export default function EmbedPage() {
  const params = useParams()
  const spaceId = params.spaceId as string
  const [currentPlan, setCurrentPlan] = useState<PlanKey>('free')

  useEffect(() => {
    fetch('/api/subscription')
      .then(r => r.json())
      .then(data => setCurrentPlan((data.plan || 'free') as PlanKey))
      .catch(() => {})
  }, [])

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com'

  const wallCode = `<!-- Trustwall Testimonials Widget -->\n<div id="trustwall-widget" data-space="${spaceId}" data-style="wall"></div>\n<script src="${origin}/api/embed-js" async></script>`
  const carouselCode = `<!-- Trustwall Testimonials Widget -->\n<div id="trustwall-widget" data-space="${spaceId}" data-style="carousel"></div>\n<script src="${origin}/api/embed-js" async></script>`
  const minimalCode = `<!-- Trustwall Testimonials Widget -->\n<div id="trustwall-widget" data-space="${spaceId}" data-style="minimal"></div>\n<script src="${origin}/api/embed-js" async></script>`

  const [copied, setCopied] = useState<string | null>(null)
  const copy = (code: string, label: string) => {
    navigator.clipboard.writeText(code)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const allowedStyles = PLAN_DETAILS[currentPlan].widgetStyles

  const badgeCode = `<!-- Trustwall Rating Badge -->\n<div id="trustwall-widget" data-space="${spaceId}" data-style="badge"></div>\n<script src="${origin}/api/embed-js" async></script>`

  const styles = [
    { key: 'wall', label: 'Wall (Grid)', code: wallCode, desc: 'Masonry grid of testimonial cards', icon: LayoutGrid },
    { key: 'carousel', label: 'Carousel', code: carouselCode, desc: 'Auto-scrolling carousel', icon: GalleryHorizontal },
    { key: 'minimal', label: 'Minimal', code: minimalCode, desc: 'Clean single-column list', icon: List },
    { key: 'badge', label: 'Rating Badge', code: badgeCode, desc: 'Compact star rating summary', icon: Star },
  ]

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <Link
        href={`/dashboard/spaces/${spaceId}`}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Space
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Embed Widget</h1>
      <p className="text-slate-500 text-sm mb-8">
        Copy the code snippet and paste it into your website&apos;s HTML.
        Only <strong>approved</strong> testimonials will appear.
      </p>

      <div className="space-y-4">
        {styles.map((s, i) => {
          const isLocked = !(allowedStyles as readonly string[]).includes(s.key)

          return (
            <div
              key={s.label}
              className={`glass-card rounded-2xl p-5 transition-all duration-200 animate-fade-in-up ${
                isLocked ? 'opacity-60' : 'hover:shadow-md'
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLocked ? 'bg-slate-100' : 'bg-blue-50'}`}>
                    <s.icon className={`w-5 h-5 ${isLocked ? 'text-slate-400' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 text-sm">{s.label}</h3>
                      {isLocked && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" /> Starter+
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{s.desc}</p>
                  </div>
                </div>
                {isLocked ? (
                  <Link
                    href="/dashboard/billing"
                    className="px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Crown className="w-3 h-3" /> Upgrade
                  </Link>
                ) : (
                  <button
                    onClick={() => copy(s.code, s.label)}
                    className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {copied === s.label ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy Code</>}
                  </button>
                )}
              </div>
              {!isLocked && (
                <pre className="bg-slate-900 text-green-400 text-xs p-4 rounded-xl overflow-x-auto">
                  <code>{s.code}</code>
                </pre>
              )}
              {isLocked && (
                <div className="bg-slate-50 text-slate-400 text-xs p-4 rounded-xl text-center">
                  Upgrade to Starter or Pro to unlock this widget style
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Branding note */}
      {!PLAN_DETAILS[currentPlan].removeBranding && (
        <div className="mt-6 glass-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">Remove &quot;Powered by Trustwall&quot; branding</p>
            <p className="text-xs text-slate-400 mt-0.5">Upgrade to Starter or Pro for white-label widgets</p>
          </div>
          <Link
            href="/dashboard/billing"
            className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
          >
            <Crown className="w-3 h-3" /> Upgrade
          </Link>
        </div>
      )}
    </div>
  )
}
