'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Sparkles, ArrowRight, Crown, Zap } from 'lucide-react'

interface Space {
  id: string
  name: string
  slug: string
  primaryColor: string
  createdAt: string
  _count: { testimonials: number }
}

interface Usage {
  plan: string
  spaces: { used: number; limit: number; percentage: number }
  testimonials: { total: number; limitPerSpace: number }
}

export default function DashboardPage() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [usage, setUsage] = useState<Usage | null>(null)

  useEffect(() => {
    fetch('/api/spaces')
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch spaces')
        return r.json()
      })
      .then(data => { if (Array.isArray(data)) setSpaces(data) })
      .catch(() => setSpaces([]))
      .finally(() => setLoading(false))

    fetch('/api/usage')
      .then(r => r.json())
      .then(data => setUsage(data))
      .catch(() => {})
  }, [])

  return (
    <div>
      {/* Usage Banner */}
      {usage && usage.plan === 'free' && usage.spaces.used > 0 && (
        <div className="glass-card rounded-2xl p-5 mb-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Free Plan Usage</span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600">Spaces</span>
                    <span className="font-medium text-slate-900">
                      {usage.spaces.used} / {usage.spaces.limit === Infinity ? '\u221e' : usage.spaces.limit}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        usage.spaces.percentage >= 100 ? 'bg-rose-500' : usage.spaces.percentage >= 80 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, usage.spaces.percentage)}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  {usage.testimonials.limitPerSpace === Infinity
                    ? 'Unlimited testimonials per space'
                    : `${usage.testimonials.limitPerSpace} testimonials per space`
                  }
                </p>
              </div>
            </div>
            {usage.spaces.percentage >= 80 && (
              <Link
                href="/dashboard/billing"
                className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-md shadow-blue-200 whitespace-nowrap"
              >
                <Crown className="w-4 h-4" /> Upgrade Plan
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Your Spaces</h1>
          <p className="text-slate-500 text-sm mt-1">Collect testimonials for each product or brand</p>
        </div>
        <Link
          href="/dashboard/spaces/new"
          className="hidden sm:flex px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md shadow-blue-200 items-center gap-2 cursor-pointer hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> New Space
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : spaces.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>No spaces yet</h3>
          <p className="text-slate-500 mb-6 text-sm max-w-sm mx-auto">Create your first space to start collecting testimonials from your customers</p>
          <Link
            href="/dashboard/spaces/new"
            className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 cursor-pointer inline-flex items-center gap-2 shadow-md shadow-blue-200 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" /> Create Your First Space
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {spaces.map((space, i) => (
            <Link
              key={space.id}
              href={`/dashboard/spaces/${space.id}`}
              className="group glass-card rounded-2xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: space.primaryColor }}
                >
                  {space.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  {space._count.testimonials} testimonial{space._count.testimonials !== 1 ? 's' : ''}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {space.name}
              </h3>
              <p className="text-sm text-slate-400">/{space.slug}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {new Date(space.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-xs font-medium text-blue-600 group-hover:translate-x-0.5 transition-transform duration-200 flex items-center gap-1">
                  View <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
