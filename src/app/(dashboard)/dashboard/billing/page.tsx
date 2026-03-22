'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PLAN_DETAILS, type PlanKey } from '@/lib/plans'
import { CheckCircle2, X, Sparkles, ArrowRight, Zap, Crown, ExternalLink, PartyPopper } from 'lucide-react'

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48 mb-4" />
        <div className="h-4 bg-slate-100 rounded w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-96 bg-white/60 rounded-2xl" />)}
        </div>
      </div>
    }>
      <BillingContent />
    </Suspense>
  )
}

function BillingContent() {
  const [current, setCurrent] = useState<PlanKey>('free')
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const cancelled = searchParams.get('cancelled')

  useEffect(() => {
    // If returning from Stripe checkout, sync subscription from Stripe
    const syncParam = success ? '?sync=true' : ''
    fetch(`/api/subscription${syncParam}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed')
        return r.json()
      })
      .then(data => setCurrent((data.plan || 'free') as PlanKey))
      .catch(() => setCurrent('free'))
      .finally(() => setLoading(false))
  }, [success])

  useEffect(() => {
    if (success) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 6000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const handleCheckout = async (plan: string) => {
    setCheckoutLoading(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to create checkout session')
      }
    } catch {
      alert('Something went wrong')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handlePortal = async () => {
    try {
      const res = await fetch('/api/billing-portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to open billing portal')
      }
    } catch {
      alert('Something went wrong')
    }
  }

  const planIcons: Record<PlanKey, typeof Sparkles> = {
    free: Sparkles,
    starter: Zap,
    pro: Crown,
  }

  const currentPlan = PLAN_DETAILS[current]

  return (
    <div className="max-w-5xl mx-auto">
      {/* Success Celebration Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="glass-strong rounded-3xl p-8 max-w-md mx-4 text-center animate-scale-in shadow-2xl">
            <div className="relative">
              {/* Confetti particles */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-confetti"
                  style={{
                    left: `${20 + i * 8}%`,
                    animationDelay: `${i * 0.1}s`,
                    color: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#f43f5e', '#06b6d4'][i],
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'currentColor' }} />
                </div>
              ))}
            </div>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Welcome to {currentPlan.name}!
            </h2>
            <p className="text-slate-500 mb-6">
              Your plan has been upgraded. You now have access to all {currentPlan.name} features.
            </p>
            <div className="glass-card rounded-xl p-4 mb-6 text-left space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Unlocked Features</p>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                {currentPlan.maxSpaces === Infinity ? 'Unlimited' : currentPlan.maxSpaces} spaces
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                {currentPlan.maxTestimonialsPerSpace === Infinity ? 'Unlimited' : currentPlan.maxTestimonialsPerSpace} testimonials per space
              </div>
              {currentPlan.removeBranding && (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> No branding on widgets
                </div>
              )}
              {currentPlan.customCss && (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> Custom CSS styling
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSuccess(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Stay Here
              </button>
              <Link
                href="/dashboard"
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Plans & Billing</h1>
        <p className="text-slate-500 text-sm mt-1">Choose the plan that fits your needs</p>
      </div>

      {/* Success/Cancelled banners */}
      {success && !showSuccess && (
        <div className="mb-6 glass-card bg-green-50/80 text-green-700 px-5 py-4 rounded-2xl text-sm font-medium flex items-center gap-3 animate-fade-in-up" role="alert">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          <div>
            <p className="font-semibold">Payment successful!</p>
            <p className="text-green-600 text-xs mt-0.5">Your plan has been upgraded to {currentPlan.name}.</p>
          </div>
        </div>
      )}
      {cancelled && (
        <div className="mb-6 glass-card bg-amber-50/80 text-amber-700 px-5 py-4 rounded-2xl text-sm font-medium flex items-center gap-3 animate-fade-in-up" role="alert">
          <X className="w-5 h-5 text-amber-500 shrink-0" />
          Checkout was cancelled. No charges were made.
        </div>
      )}

      {/* Current Plan Summary */}
      <div className="mb-8 glass-card rounded-2xl p-6 shadow-sm animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              current === 'pro' ? 'bg-purple-100' : current === 'starter' ? 'bg-blue-100' : 'bg-slate-100'
            }`}>
              {(() => { const Icon = planIcons[current]; return <Icon className={`w-6 h-6 ${
                current === 'pro' ? 'text-purple-600' : current === 'starter' ? 'text-blue-600' : 'text-slate-500'
              }`} /> })()}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Current Plan</p>
              <p className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {currentPlan.name}
                {current !== 'free' && <span className="text-slate-400 font-normal text-sm ml-2">${currentPlan.price}/mo</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {current !== 'free' && (
              <button
                onClick={handlePortal}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 glass-card rounded-xl hover:bg-white transition-all duration-200 cursor-pointer flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" /> Manage Subscription
              </button>
            )}
            <Link
              href="/dashboard"
              className="px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-200 cursor-pointer flex items-center gap-1.5"
            >
              <ArrowRight className="w-4 h-4" /> Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Quick feature summary for current plan */}
        <div className="mt-4 pt-4 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-xl bg-white/50">
            <p className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {currentPlan.maxSpaces === Infinity ? '\u221e' : currentPlan.maxSpaces}
            </p>
            <p className="text-xs text-slate-500">Spaces</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/50">
            <p className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {currentPlan.maxTestimonialsPerSpace === Infinity ? '\u221e' : currentPlan.maxTestimonialsPerSpace}
            </p>
            <p className="text-xs text-slate-500">Per Space</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/50">
            <p className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {currentPlan.widgetStyles.length}
            </p>
            <p className="text-xs text-slate-500">Widget Styles</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/50">
            <p className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {currentPlan.removeBranding ? 'Yes' : 'No'}
            </p>
            <p className="text-xs text-slate-500">No Branding</p>
          </div>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.entries(PLAN_DETAILS) as [PlanKey, typeof PLAN_DETAILS[PlanKey]][]).map(([key, plan], index) => {
          const isActive = key === current
          const isStarter = key === 'starter'
          const Icon = planIcons[key]

          return (
            <div
              key={key}
              className={`rounded-2xl p-6 transition-all duration-300 animate-fade-in-up ${
                isActive
                  ? 'glass-strong border-2 border-blue-400 shadow-lg shadow-blue-100 ring-2 ring-blue-100'
                  : isStarter
                  ? 'glass-card border-2 border-blue-300 shadow-md hover:shadow-lg hover:-translate-y-0.5'
                  : 'glass-card border-2 border-transparent hover:border-slate-200 hover:shadow-md hover:-translate-y-0.5'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {isStarter && !isActive && (
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Most Popular
                </div>
              )}
              {isActive && (
                <div className="text-xs font-bold text-green-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Your Current Plan
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  key === 'pro' ? 'bg-purple-100' : key === 'starter' ? 'bg-blue-100' : 'bg-slate-100'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    key === 'pro' ? 'text-purple-600' : key === 'starter' ? 'text-blue-600' : 'text-slate-500'
                  }`} />
                </div>
                <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{plan.name}</h3>
              </div>

              <div className="mb-5">
                <span className="text-4xl font-extrabold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>${plan.price}</span>
                <span className="text-slate-400 text-sm">/mo</span>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="font-medium">{plan.maxSpaces === Infinity ? 'Unlimited' : plan.maxSpaces}</span> space{plan.maxSpaces !== 1 ? 's' : ''}
                </li>
                <li className="flex items-center gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="font-medium">{plan.maxTestimonialsPerSpace === Infinity ? 'Unlimited' : plan.maxTestimonialsPerSpace}</span> testimonials/space
                </li>
                <li className="flex items-center gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="font-medium">{plan.widgetStyles.length <= 2 ? `${plan.widgetStyles.length} widget styles` : 'All widget styles'}</span>
                </li>
                <li className={`flex items-center gap-2.5 text-sm ${plan.removeBranding ? 'text-slate-700' : 'text-slate-400'}`}>
                  {plan.removeBranding
                    ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    : <X className="w-4 h-4 text-slate-300 shrink-0" />
                  }
                  No branding
                </li>
                <li className={`flex items-center gap-2.5 text-sm ${plan.customCss ? 'text-slate-700' : 'text-slate-400'}`}>
                  {plan.customCss
                    ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    : <X className="w-4 h-4 text-slate-300 shrink-0" />
                  }
                  Custom CSS
                </li>
                <li className={`flex items-center gap-2.5 text-sm ${plan.csvImport ? 'text-slate-700' : 'text-slate-400'}`}>
                  {plan.csvImport
                    ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    : <X className="w-4 h-4 text-slate-300 shrink-0" />
                  }
                  CSV import
                </li>
              </ul>

              {loading ? (
                <div className="w-full py-3 bg-slate-100 rounded-xl animate-pulse h-11" />
              ) : isActive ? (
                <div className="w-full py-3 text-center text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl border border-blue-200">
                  Current Plan
                </div>
              ) : key === 'free' ? (
                <div className="w-full py-3 text-center text-sm font-medium text-slate-400 bg-slate-50 rounded-xl">
                  {current === 'free' ? 'Current Plan' : 'Manage Subscription to downgrade'}
                </div>
              ) : (
                <button
                  onClick={() => handleCheckout(key)}
                  disabled={!!checkoutLoading}
                  className={`w-full py-3 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 ${
                    isStarter
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 hover:shadow-lg'
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'
                  }`}
                >
                  {checkoutLoading === key ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>Upgrade to {plan.name} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
