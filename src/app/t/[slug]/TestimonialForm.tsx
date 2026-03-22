'use client'

import { useState } from 'react'
import { Star, PartyPopper, ChevronDown, ChevronUp } from 'lucide-react'

interface StarRatingProps {
  value: number
  onChange: (v: number) => void
  color: string
}

function StarRating({ value, onChange, color }: StarRatingProps) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform duration-150 hover:scale-110 focus:outline-none cursor-pointer"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            className={`w-7 h-7 ${(hover || value) >= star ? 'fill-current' : 'text-slate-300'}`}
            style={(hover || value) >= star ? { color } : undefined}
          />
        </button>
      ))}
    </div>
  )
}

interface TestimonialFormProps {
  space: {
    id: string
    name: string
    logo: string | null
    primaryColor: string
    thankYouMsg: string
    thankYouRedirect: string | null
  }
}

export default function TestimonialForm({ space }: TestimonialFormProps) {
  const [form, setForm] = useState({
    authorName: '',
    authorEmail: '',
    authorTitle: '',
    companyLogo: '',
    socialLink: '',
    videoUrl: '',
    text: '',
    rating: 5,
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [showExtra, setShowExtra] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaceId: space.id, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4" style={{ fontFamily: "'Open Sans', system-ui, sans-serif" }}>
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${space.primaryColor}15` }}>
            <PartyPopper className="w-8 h-8" style={{ color: space.primaryColor }} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Thank you!</h2>
          <p className="text-slate-600">{space.thankYouMsg}</p>
          {space.thankYouRedirect && (
            <a
              href={space.thankYouRedirect}
              className="inline-block mt-6 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: space.primaryColor }}
            >
              Continue &rarr;
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12" style={{ fontFamily: "'Open Sans', system-ui, sans-serif" }}>
      <div className="max-w-lg w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          {space.logo && (
            <img src={space.logo} alt={`${space.name} logo`} className="h-12 mx-auto mb-4 rounded-lg" />
          )}
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{space.name}</h1>
          <p className="text-slate-500 mt-1">We&apos;d love to hear your feedback!</p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-5"
        >
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
            <StarRating value={form.rating} onChange={(r) => setForm((p) => ({ ...p, rating: r }))} color={space.primaryColor} />
          </div>

          {/* Testimonial Text */}
          <div>
            <label htmlFor="testimonial-text" className="block text-sm font-medium text-slate-700 mb-1">Your Testimonial *</label>
            <textarea
              id="testimonial-text"
              required
              minLength={10}
              maxLength={2000}
              rows={4}
              value={form.text}
              onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
              placeholder="Share your experience..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow duration-200 resize-none"
              style={{ '--tw-ring-color': space.primaryColor } as any}
            />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="author-name" className="block text-sm font-medium text-slate-700 mb-1">Your Name *</label>
            <input
              id="author-name"
              required
              maxLength={100}
              value={form.authorName}
              onChange={(e) => setForm((p) => ({ ...p, authorName: e.target.value }))}
              placeholder="John Doe"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow duration-200"
              style={{ '--tw-ring-color': space.primaryColor } as any}
            />
          </div>

          {/* Title */}
          <div>
            <label htmlFor="author-title" className="block text-sm font-medium text-slate-700 mb-1">Title / Company</label>
            <input
              id="author-title"
              maxLength={100}
              value={form.authorTitle}
              onChange={(e) => setForm((p) => ({ ...p, authorTitle: e.target.value }))}
              placeholder="CEO at Acme Inc."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow duration-200"
              style={{ '--tw-ring-color': space.primaryColor } as any}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="author-email" className="block text-sm font-medium text-slate-700 mb-1">Email (optional)</label>
            <input
              id="author-email"
              type="email"
              value={form.authorEmail}
              onChange={(e) => setForm((p) => ({ ...p, authorEmail: e.target.value }))}
              placeholder="john@example.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow duration-200"
              style={{ '--tw-ring-color': space.primaryColor } as any}
            />
          </div>

          {/* Extra fields toggle */}
          <button
            type="button"
            onClick={() => setShowExtra(!showExtra)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            {showExtra ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showExtra ? 'Less details' : 'Add more details'}
          </button>

          {showExtra && (
            <div className="space-y-4">
              <div>
                <label htmlFor="company-logo" className="block text-sm font-medium text-slate-700 mb-1">Company Logo URL (optional)</label>
                <input
                  id="company-logo"
                  type="url"
                  value={form.companyLogo}
                  onChange={(e) => setForm((p) => ({ ...p, companyLogo: e.target.value }))}
                  placeholder="https://yourcompany.com/logo.png"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow duration-200"
                  style={{ '--tw-ring-color': space.primaryColor } as any}
                />
              </div>
              <div>
                <label htmlFor="social-link" className="block text-sm font-medium text-slate-700 mb-1">Social Profile (optional)</label>
                <input
                  id="social-link"
                  type="url"
                  value={form.socialLink}
                  onChange={(e) => setForm((p) => ({ ...p, socialLink: e.target.value }))}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow duration-200"
                  style={{ '--tw-ring-color': space.primaryColor } as any}
                />
              </div>
              <div>
                <label htmlFor="video-url" className="block text-sm font-medium text-slate-700 mb-1">Video Testimonial URL (optional)</label>
                <input
                  id="video-url"
                  type="url"
                  value={form.videoUrl}
                  onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=... or https://loom.com/share/..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow duration-200"
                  style={{ '--tw-ring-color': space.primaryColor } as any}
                />
                <p className="text-xs text-slate-400 mt-1">Supports YouTube, Loom, and Vimeo links</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-xl" role="alert">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: space.primaryColor }}
          >
            {submitting ? 'Submitting...' : 'Submit Testimonial'}
          </button>

          <p className="text-xs text-center text-slate-400">
            Powered by <a href="/" className="underline hover:text-slate-600 transition-colors duration-200">Trustwall</a>
          </p>
        </form>
      </div>
    </div>
  )
}
