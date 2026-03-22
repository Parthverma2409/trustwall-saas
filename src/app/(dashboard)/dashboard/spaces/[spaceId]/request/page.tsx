'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Copy, Check, Mail, MessageCircle, Linkedin, Share2, QrCode, Download } from 'lucide-react'
import QRCode from 'qrcode'

interface SpaceData {
  name: string
  slug: string
}

const templates = [
  {
    id: 'email',
    label: 'Email',
    icon: Mail,
    color: 'bg-blue-50 text-blue-600',
    subject: (name: string) => `Quick favor — share your experience with ${name}?`,
    body: (name: string, url: string) =>
`Hi [Name],

I hope you're doing well! I'm collecting testimonials for ${name} and your feedback would mean a lot to me.

It only takes 30 seconds — just click the link below and share your thoughts:

${url}

Thank you so much!

Best regards`,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    color: 'bg-green-50 text-green-600',
    subject: () => '',
    body: (name: string, url: string) =>
`Hey! 👋

I'd really appreciate it if you could leave a quick testimonial about your experience with ${name}. It only takes 30 seconds!

${url}

Thanks a lot! 🙏`,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn DM',
    icon: Linkedin,
    color: 'bg-sky-50 text-sky-600',
    subject: () => '',
    body: (name: string, url: string) =>
`Hi [Name],

I'm reaching out because I value your perspective. Would you be willing to share a brief testimonial about your experience working with ${name}?

It takes less than a minute — here's the link: ${url}

I'd really appreciate it. Thank you!`,
  },
  {
    id: 'generic',
    label: 'Generic',
    icon: Share2,
    color: 'bg-purple-50 text-purple-600',
    subject: () => '',
    body: (name: string, url: string) =>
`Hey! I'd love to hear your feedback about ${name}. Could you take 30 seconds to share a testimonial?

${url}

Thank you — it really helps! 🙏`,
  },
]

export default function RequestPage() {
  const params = useParams()
  const spaceId = params.spaceId as string
  const [space, setSpace] = useState<SpaceData | null>(null)
  const [active, setActive] = useState('email')
  const [copied, setCopied] = useState<string | null>(null)
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)
  const [qrReady, setQrReady] = useState(false)

  useEffect(() => {
    fetch(`/api/spaces/${spaceId}`)
      .then(r => r.json())
      .then(data => setSpace(data))
      .catch(() => {})
  }, [spaceId])

  const shareUrl = space ? `${typeof window !== 'undefined' ? window.location.origin : ''}/t/${space.slug}` : ''

  useEffect(() => {
    if (space && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, shareUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#1e293b', light: '#ffffff' },
      }, () => setQrReady(true))
    }
  }, [space, shareUrl])

  if (!space) {
    return <div className="max-w-2xl mx-auto animate-pulse"><div className="h-8 bg-slate-200 rounded w-48 mb-4" /></div>
  }

  const activeTemplate = templates.find(t => t.id === active) ?? templates[0]

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const downloadQr = () => {
    if (!qrCanvasRef.current) return
    const link = document.createElement('a')
    link.download = `${space.slug}-qr-code.png`
    link.href = qrCanvasRef.current.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <Link
        href={`/dashboard/spaces/${spaceId}`}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Space
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
        Request Testimonials
      </h1>
      <p className="text-slate-500 text-sm mb-8">
        Use these ready-made templates to ask your clients for testimonials. Just copy, personalize, and send.
      </p>

      {/* Channel tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {templates.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              active === t.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'glass-card text-slate-600 hover:bg-white'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Template card */}
      <div className="glass-card rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTemplate.color}`}>
              <activeTemplate.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">{activeTemplate.label} Template</h3>
              <p className="text-xs text-slate-400">Customize the [Name] placeholder before sending</p>
            </div>
          </div>
        </div>

        {/* Subject line (email only) */}
        {activeTemplate.id === 'email' && (
          <div className="mb-4">
            <label className="text-xs font-medium text-slate-500 mb-1 block">Subject Line</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/80 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700">
                {activeTemplate.subject(space.name)}
              </div>
              <button
                onClick={() => copyText(activeTemplate.subject(space.name), 'subject')}
                className="p-2.5 text-slate-400 hover:text-blue-600 glass-card rounded-xl transition-colors cursor-pointer"
              >
                {copied === 'subject' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Message body */}
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Message</label>
          <div className="relative">
            <pre className="bg-white/80 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
              {activeTemplate.body(space.name, shareUrl)}
            </pre>
            <button
              onClick={() => copyText(activeTemplate.body(space.name, shareUrl), 'body')}
              className="absolute top-3 right-3 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {copied === 'body' ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy Message</>}
            </button>
          </div>
        </div>

        {/* Collection link */}
        <div className="mt-4 pt-4 border-t border-slate-200/60">
          <label className="text-xs font-medium text-slate-500 mb-1 block">Your Collection Link</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-blue-50 rounded-xl px-4 py-2.5 text-sm text-blue-700 font-mono truncate">
              {shareUrl}
            </div>
            <button
              onClick={() => copyText(shareUrl, 'link')}
              className="p-2.5 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
            >
              {copied === 'link' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="glass-card rounded-2xl p-6 shadow-sm mt-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">QR Code</h3>
            <p className="text-xs text-slate-400">Print or share — clients scan to leave a testimonial</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <canvas ref={qrCanvasRef} />
          </div>
          <div className="flex-1 space-y-3">
            <p className="text-sm text-slate-600">
              Display this QR code on printed materials, business cards, invoices, or at events. When scanned, it opens your testimonial collection form.
            </p>
            <button
              onClick={downloadQr}
              disabled={!qrReady}
              className="px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Download PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
