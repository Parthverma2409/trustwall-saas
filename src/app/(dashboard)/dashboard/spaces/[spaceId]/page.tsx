'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Copy, Code2, Trash2, Star, Check, X, ExternalLink, Upload, FileSpreadsheet, Crown, Heart, Send, Tag, Plus, Settings, Image, Sparkles, Video } from 'lucide-react'
import { getEmbedUrl } from '@/lib/video-embed'

interface Testimonial {
  id: string
  authorName: string
  authorEmail: string | null
  authorTitle: string | null
  companyLogo: string | null
  socialLink: string | null
  text: string
  rating: number
  status: string
  isFavorite: boolean
  tags: string[]
  aiSummary: string | null
  language: string | null
  videoUrl: string | null
  createdAt: string
}

interface SpaceData {
  id: string
  name: string
  slug: string
  primaryColor: string
  views: number
  _count: { testimonials: number }
}

const tabs = ['all', 'pending', 'approved', 'rejected'] as const

export default function SpaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const spaceId = params.spaceId as string

  const [space, setSpace] = useState<SpaceData | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('all')
  const [copiedLink, setCopiedLink] = useState(false)
  const [userPlan, setUserPlan] = useState('free')
  const [showImport, setShowImport] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success?: boolean; count?: number; error?: string } | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [editingTagsId, setEditingTagsId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      let testUrl = `/api/testimonials?spaceId=${spaceId}`
      if (activeTab !== 'all') testUrl += `&status=${activeTab}`
      if (activeTag) testUrl += `&tag=${encodeURIComponent(activeTag)}`
      const [spaceRes, testRes] = await Promise.all([
        fetch(`/api/spaces/${spaceId}`),
        fetch(testUrl),
      ])
      if (spaceRes.ok) setSpace(await spaceRes.json())
      else setSpace(null)
      if (testRes.ok) {
        const data = await testRes.json()
        if (Array.isArray(data)) setTestimonials(data)
      }
    } catch {
      setSpace(null)
    } finally {
      setLoading(false)
    }
  }, [spaceId, activeTab, activeTag])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    fetch('/api/subscription')
      .then(r => r.json())
      .then(data => setUserPlan(data.plan || 'free'))
      .catch(() => {})
  }, [])

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) {
        setImportResult({ error: 'CSV must have a header row and at least one data row' })
        setImporting(false)
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
      const rows = lines.slice(1).map(line => {
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',')
        const obj: Record<string, string> = {}
        headers.forEach((h, i) => {
          obj[h] = (values[i] || '').replace(/^"|"$/g, '').trim()
        })
        // Map common header variations
        return {
          authorName: obj.authorname || obj.name || obj.author || '',
          authorEmail: obj.authoremail || obj.email || '',
          authorTitle: obj.authortitle || obj.title || obj.role || obj.position || '',
          text: obj.text || obj.testimonial || obj.review || obj.content || obj.message || '',
          rating: obj.rating || obj.stars || '5',
        }
      }).filter(r => r.authorName && r.text)

      if (rows.length === 0) {
        setImportResult({ error: 'No valid rows found. Ensure CSV has "name" and "text" columns.' })
        setImporting(false)
        return
      }

      const res = await fetch('/api/testimonials/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaceId, rows }),
      })
      const data = await res.json()
      if (res.ok) {
        setImportResult({ success: true, count: data.imported })
        fetchData()
      } else {
        setImportResult({ error: data.error })
      }
    } catch {
      setImportResult({ error: 'Failed to parse CSV file' })
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  const updateTestimonial = async (id: string, data: Partial<Testimonial>) => {
    await fetch('/api/testimonials', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    })
    fetchData()
  }

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return
    await fetch(`/api/testimonials?id=${id}`, { method: 'DELETE' })
    fetchData()
  }

  const addTag = async (testimonialId: string, tag: string) => {
    const t = testimonials.find(t => t.id === testimonialId)
    if (!t || t.tags.includes(tag)) return
    await updateTestimonial(testimonialId, { tags: [...t.tags, tag] } as any)
  }

  const removeTag = async (testimonialId: string, tag: string) => {
    const t = testimonials.find(t => t.id === testimonialId)
    if (!t) return
    await updateTestimonial(testimonialId, { tags: t.tags.filter(tg => tg !== tag) } as any)
  }

  // Collect all unique tags across testimonials
  const allTags = Array.from(new Set(testimonials.flatMap(t => t.tags || []))).sort()

  const deleteSpace = async () => {
    if (!confirm('Delete this space and all its testimonials? This cannot be undone.')) return
    await fetch(`/api/spaces/${spaceId}`, { method: 'DELETE' })
    router.push('/dashboard')
  }

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="h-4 bg-slate-100 rounded w-96 animate-pulse" />
        <div className="grid gap-3 mt-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 glass-card rounded-2xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!space) return <div className="text-center py-16 text-slate-500">Space not found</div>

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/t/${space.slug}`

  return (
    <div>
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 mb-6 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md"
              style={{ backgroundColor: space.primaryColor }}
            >
              {space.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{space.name}</h1>
              <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                <span>{space._count.testimonials} testimonial{space._count.testimonials !== 1 ? 's' : ''}</span>
                <span className="text-slate-300">|</span>
                <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                  /{space.slug} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/dashboard/spaces/${spaceId}/request`}
              className="px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-xl hover:bg-green-100 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" /> Request
            </Link>
            <a
              href={`${typeof window !== 'undefined' ? window.location.origin : ''}/wall/${space.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm font-medium text-pink-700 bg-pink-50 rounded-xl hover:bg-pink-100 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Heart className="w-4 h-4" /> Wall of Love
            </a>
            {userPlan === 'pro' ? (
              <button
                onClick={() => setShowImport(!showImport)}
                className="px-3 py-2 text-sm font-medium text-slate-700 glass-card rounded-xl hover:bg-white transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4" /> Import CSV
              </button>
            ) : (
              <Link
                href="/dashboard/billing"
                className="px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-xl hover:bg-amber-100 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                title="CSV import requires Pro plan"
              >
                <Crown className="w-3.5 h-3.5" /> Import CSV
              </Link>
            )}
            <button
              onClick={() => copyLink(shareUrl)}
              className="px-3 py-2 text-sm font-medium text-slate-700 glass-card rounded-xl hover:bg-white transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? <><Check className="w-4 h-4 text-green-500" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
            </button>
            <Link
              href={`/dashboard/spaces/${spaceId}/settings`}
              className="px-3 py-2 text-sm font-medium text-slate-700 glass-card rounded-xl hover:bg-white transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-4 h-4" /> Settings
            </Link>
            <Link
              href={`/dashboard/spaces/${spaceId}/embed`}
              className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Code2 className="w-4 h-4" /> Embed
            </Link>
            <button
              onClick={deleteSpace}
              className="px-3 py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors duration-200 cursor-pointer"
              aria-label="Delete space"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{space.views || 0}</p>
          <p className="text-xs text-slate-500 mt-0.5">Form Views</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{space._count.testimonials}</p>
          <p className="text-xs text-slate-500 mt-0.5">Submissions</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {space.views > 0 ? ((space._count.testimonials / space.views) * 100).toFixed(1) : '0'}%
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Conversion Rate</p>
        </div>
      </div>

      {/* CSV Import Panel */}
      {showImport && (
        <div className="glass-card rounded-2xl p-5 mb-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Import Testimonials from CSV</h3>
              <p className="text-xs text-slate-400">CSV should have columns: name, text, email (optional), title (optional), rating (optional)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex-1 relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvImport}
                disabled={importing}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                {importing ? 'Importing...' : 'Choose CSV file'}
              </div>
            </label>
            <button
              onClick={() => { setShowImport(false); setImportResult(null) }}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {importResult && (
            <div className={`mt-3 px-4 py-2.5 rounded-xl text-sm ${
              importResult.success
                ? 'bg-green-50 text-green-700'
                : 'bg-rose-50 text-rose-600'
            }`}>
              {importResult.success
                ? `Successfully imported ${importResult.count} testimonial${importResult.count !== 1 ? 's' : ''}!`
                : importResult.error
              }
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 glass-card rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 capitalize cursor-pointer ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Tag className="w-4 h-4 text-slate-400" />
          <button
            onClick={() => setActiveTag(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
              activeTag === null
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white/60 text-slate-500 hover:bg-white border border-slate-200/60'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
                activeTag === tag
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/60 text-slate-500 hover:bg-white border border-slate-200/60'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Testimonials List */}
      {testimonials.length === 0 ? (
        <div className="text-center py-14 glass-card rounded-2xl animate-fade-in-up">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Star className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm mb-1 font-medium">
            {activeTab === 'all' ? 'No testimonials yet' : `No ${activeTab} testimonials`}
          </p>
          {activeTab === 'all' && (
            <p className="text-slate-400 text-xs">Share your link to start collecting feedback</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              className="glass-card rounded-2xl p-5 hover:shadow-md transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed mb-2">&ldquo;{t.text}&rdquo;</p>
                  {t.aiSummary ? (
                    <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 bg-violet-50 rounded-lg border border-violet-100">
                      <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                      <p className="text-xs text-violet-700 font-medium">{t.aiSummary}</p>
                    </div>
                  ) : (
                    <button
                      onClick={async () => {
                        const res = await fetch('/api/testimonials/summary', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: t.id }),
                        })
                        if (res.ok) fetchData()
                      }}
                      className="flex items-center gap-1 text-[11px] text-violet-500 hover:text-violet-700 mb-3 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" /> Generate highlight
                    </button>
                  )}
                  {t.videoUrl && (() => {
                    const embedUrl = getEmbedUrl(t.videoUrl)
                    return embedUrl ? (
                      <div className="mb-3 rounded-xl overflow-hidden border border-slate-200/60">
                        <iframe
                          src={embedUrl}
                          className="w-full aspect-video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <a href={t.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 mb-3 transition-colors">
                        <Video className="w-3.5 h-3.5" /> Watch video testimonial
                      </a>
                    )
                  })()}
                  <div className="flex items-center gap-2 text-sm">
                    {t.companyLogo && (
                      <img src={t.companyLogo} alt="" className="w-5 h-5 rounded object-contain" />
                    )}
                    <span className="font-semibold text-slate-900">{t.authorName}</span>
                    {t.authorTitle && <span className="text-slate-400">- {t.authorTitle}</span>}
                    {t.socialLink && (
                      <a href={t.socialLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-4 shrink-0">
                  {t.status === 'approved' && (
                    <a
                      href={`/api/og/testimonial?id=${t.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-white/50 text-slate-400 rounded-lg hover:text-violet-600 hover:bg-violet-50 transition-colors duration-200 cursor-pointer"
                      aria-label="Share as image"
                      title="Open shareable image"
                    >
                      <Image className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => updateTestimonial(t.id, { isFavorite: !t.isFavorite })}
                    className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${t.isFavorite ? 'bg-amber-50 text-amber-500 shadow-sm' : 'bg-white/50 text-slate-400 hover:text-amber-500'}`}
                    aria-label={t.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star className={`w-4 h-4 ${t.isFavorite ? 'fill-amber-400' : ''}`} />
                  </button>
                  {t.status !== 'approved' && (
                    <button
                      onClick={() => updateTestimonial(t.id, { status: 'approved' })}
                      className="p-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200 cursor-pointer"
                      aria-label="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {t.status !== 'rejected' && (
                    <button
                      onClick={() => updateTestimonial(t.id, { status: 'rejected' })}
                      className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors duration-200 cursor-pointer"
                      aria-label="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteTestimonial(t.id)}
                    className="p-1.5 bg-white/50 text-slate-400 rounded-lg hover:text-rose-600 hover:bg-rose-50 transition-colors duration-200 cursor-pointer"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                  t.status === 'approved' ? 'bg-green-100 text-green-700'
                  : t.status === 'rejected' ? 'bg-rose-100 text-rose-600'
                  : 'bg-amber-100 text-amber-700'
                }`}>{t.status}</span>
                <span className="text-[11px] text-slate-400">
                  {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                {t.language && t.language !== 'en' && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase">
                    {t.language}
                  </span>
                )}

                {/* Tags */}
                {(t.tags || []).map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    {tag}
                    <button
                      onClick={() => removeTag(t.id, tag)}
                      className="hover:text-rose-500 transition-colors cursor-pointer"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {editingTagsId === t.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const val = tagInput.trim().toLowerCase()
                      if (val) {
                        addTag(t.id, val)
                        setTagInput('')
                      }
                    }}
                    className="inline-flex items-center gap-1"
                  >
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      placeholder="tag name"
                      className="w-24 px-2 py-0.5 text-[11px] border border-slate-200 rounded-full bg-white focus:outline-none focus:border-blue-400"
                      autoFocus
                      onBlur={() => { if (!tagInput.trim()) setEditingTagsId(null) }}
                    />
                    <button type="submit" className="text-blue-600 hover:text-blue-700 cursor-pointer">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => { setEditingTagsId(null); setTagInput('') }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => { setEditingTagsId(t.id); setTagInput('') }}
                    className="inline-flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    aria-label="Add tag"
                  >
                    <Plus className="w-3 h-3" /> tag
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
