'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Palette, MessageSquare, ExternalLink, Check, ShieldCheck, Star } from 'lucide-react'

interface SpaceSettings {
  id: string
  name: string
  slug: string
  logo: string | null
  primaryColor: string
  thankYouMsg: string
  thankYouRedirect: string | null
  autoApprove: boolean
  autoApproveMinRating: number | null
}

export default function SpaceSettingsPage() {
  const params = useParams()
  const spaceId = params.spaceId as string

  const [space, setSpace] = useState<SpaceSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    logo: '',
    primaryColor: '#6366f1',
    thankYouMsg: 'Thank you for your testimonial!',
    thankYouRedirect: '',
    autoApprove: false,
    autoApproveMinRating: 4,
  })

  useEffect(() => {
    fetch(`/api/spaces/${spaceId}`)
      .then(r => r.json())
      .then(data => {
        setSpace(data)
        setForm({
          name: data.name || '',
          logo: data.logo || '',
          primaryColor: data.primaryColor || '#6366f1',
          thankYouMsg: data.thankYouMsg || 'Thank you for your testimonial!',
          thankYouRedirect: data.thankYouRedirect || '',
          autoApprove: data.autoApprove || false,
          autoApproveMinRating: data.autoApproveMinRating ?? 4,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [spaceId])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const res = await fetch(`/api/spaces/${spaceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError('Failed to save settings. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-32" />
        <div className="h-64 bg-white/60 rounded-2xl" />
      </div>
    )
  }

  if (!space) return <div className="text-center py-16 text-slate-500">Space not found</div>

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <Link
        href={`/dashboard/spaces/${spaceId}`}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Space
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
        Space Settings
      </h1>
      <p className="text-slate-500 text-sm mb-8">Customize your space branding, thank-you page, and automation rules.</p>

      <div className="space-y-6">
        {/* Branding */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Palette className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-slate-900">Branding</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="space-name" className="block text-sm font-medium text-slate-700 mb-1">Space Name</label>
              <input
                id="space-name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="space-logo" className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
              <input
                id="space-logo"
                value={form.logo}
                onChange={e => setForm(f => ({ ...f, logo: e.target.value }))}
                placeholder="https://example.com/logo.png"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="primary-color" className="block text-sm font-medium text-slate-700 mb-1">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  id="primary-color"
                  type="color"
                  value={form.primaryColor}
                  onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                />
                <input
                  value={form.primaryColor}
                  onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Thank You Page */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold text-slate-900">Thank-You Page</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="thank-you-msg" className="block text-sm font-medium text-slate-700 mb-1">Thank-You Message</label>
              <textarea
                id="thank-you-msg"
                value={form.thankYouMsg}
                onChange={e => setForm(f => ({ ...f, thankYouMsg: e.target.value }))}
                rows={3}
                maxLength={500}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">{form.thankYouMsg.length}/500 characters</p>
            </div>

            <div>
              <label htmlFor="thank-you-redirect" className="block text-sm font-medium text-slate-700 mb-1">
                Redirect URL <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  id="thank-you-redirect"
                  type="url"
                  value={form.thankYouRedirect}
                  onChange={e => setForm(f => ({ ...f, thankYouRedirect: e.target.value }))}
                  placeholder="https://yoursite.com/thanks"
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">After submitting, users will see a &quot;Continue&quot; button linking here.</p>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 pt-5 border-t border-slate-200/60">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Preview</p>
            <div className="bg-slate-50 rounded-xl p-6 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: `${form.primaryColor}15` }}
              >
                <MessageSquare className="w-6 h-6" style={{ color: form.primaryColor }} />
              </div>
              <p className="font-bold text-slate-900 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>Thank you!</p>
              <p className="text-sm text-slate-600">{form.thankYouMsg || 'Your message here...'}</p>
              {form.thankYouRedirect && (
                <span
                  className="inline-block mt-4 px-5 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: form.primaryColor }}
                >
                  Continue &rarr;
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Auto-Approve Rules */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck className="w-5 h-5 text-violet-600" />
            <h2 className="font-semibold text-slate-900">Auto-Approve Rules</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.autoApprove}
                  onChange={e => setForm(f => ({ ...f, autoApprove: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:bg-violet-600 transition-colors duration-200" />
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:translate-x-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Enable auto-approve</p>
                <p className="text-xs text-slate-400">Automatically approve testimonials that match your criteria</p>
              </div>
            </label>

            {form.autoApprove && (
              <div className="pl-14 space-y-3 animate-fade-in-up">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Minimum star rating to auto-approve</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, autoApproveMinRating: rating }))}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                          form.autoApproveMinRating === rating
                            ? 'bg-violet-600 text-white shadow-sm'
                            : 'bg-white/60 text-slate-500 hover:bg-white border border-slate-200/60'
                        }`}
                      >
                        {rating} <Star className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Testimonials with {form.autoApproveMinRating}+ stars will be auto-approved. Lower ratings go to pending review.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          {saved ? (
            <><Check className="w-4 h-4" /> Saved!</>
          ) : saving ? (
            'Saving...'
          ) : (
            <><Save className="w-4 h-4" /> Save Changes</>
          )}
        </button>
      </div>
    </div>
  )
}
