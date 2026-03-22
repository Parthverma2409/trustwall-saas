'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function NewSpacePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    slug: '',
    primaryColor: '#2563eb',
    thankYouMsg: 'Thank you for your testimonial!',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 50)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create space')
      router.push(`/dashboard/spaces/${data.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto animate-fade-in-up">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>Create New Space</h1>

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-5 shadow-sm">
        <div>
          <label htmlFor="space-name" className="block text-sm font-medium text-slate-700 mb-1.5">Space Name *</label>
          <input
            id="space-name"
            required
            value={form.name}
            onChange={(e) => setForm(p => ({ ...p, name: e.target.value, slug: autoSlug(e.target.value) }))}
            placeholder="My SaaS Product"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div>
          <label htmlFor="space-slug" className="block text-sm font-medium text-slate-700 mb-1.5">URL Slug</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 whitespace-nowrap">trustwall.app/t/</span>
            <input
              id="space-slug"
              required
              value={form.slug}
              onChange={(e) => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Brand Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.primaryColor}
              onChange={(e) => setForm(p => ({ ...p, primaryColor: e.target.value }))}
              className="h-10 w-14 rounded-lg border border-slate-200 cursor-pointer"
            />
            <span className="text-sm text-slate-500 font-mono">{form.primaryColor}</span>
          </div>
        </div>

        <div>
          <label htmlFor="thank-you-msg" className="block text-sm font-medium text-slate-700 mb-1.5">Thank-You Message</label>
          <textarea
            id="thank-you-msg"
            maxLength={500}
            rows={2}
            value={form.thankYouMsg}
            onChange={(e) => setForm(p => ({ ...p, thankYouMsg: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
          />
        </div>

        {error && <div className="bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-xl border border-rose-100" role="alert">{error}</div>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 glass-card rounded-xl hover:bg-white transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-md shadow-blue-200 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : 'Create Space'}
          </button>
        </div>
      </form>
    </div>
  )
}
