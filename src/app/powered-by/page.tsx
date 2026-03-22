import Link from 'next/link'
import { Star, ArrowRight, CheckCircle2, Zap, Shield, Code2 } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trustwall — Collect & Embed Testimonials for Free',
  description: 'The simplest way to collect customer testimonials and showcase them on your website. Free to start, embed anywhere.',
}

export default function PoweredByPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white" style={{ fontFamily: "'Open Sans', system-ui, sans-serif" }}>
      <div className="max-w-3xl mx-auto px-6 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Star className="w-3.5 h-3.5 fill-blue-500" /> You just saw Trustwall in action
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-5 leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Collect testimonials.<br />
            <span className="text-blue-600">Embed anywhere.</span>
          </h1>

          <p className="text-slate-500 text-lg max-w-xl mx-auto mb-8">
            The website you just visited uses Trustwall to collect and display customer testimonials. You can do the same — for free.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-8 py-3.5 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-200 hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              Start Collecting Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {[
            { step: '1', title: 'Create a Space', desc: 'Name your brand and customize the look', icon: Zap },
            { step: '2', title: 'Share Your Link', desc: 'Send clients a simple form to leave feedback', icon: Shield },
            { step: '3', title: 'Embed on Your Site', desc: 'Copy one line of code and testimonials appear', icon: Code2 },
          ].map(item => (
            <div key={item.step} className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{item.title}</h3>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Why Trustwall */}
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-8 mb-16">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Why businesses choose Trustwall
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Free forever plan — no credit card needed',
              'Takes 2 minutes to set up',
              'Beautiful embed widgets (3 styles)',
              'Works on any website',
              'Shareable Wall of Love page',
              'CSV import for existing testimonials',
            ].map(item => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-4">Join businesses already using Trustwall</p>
          <Link
            href="/"
            className="px-8 py-3.5 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-200 hover:-translate-y-0.5 inline-flex items-center gap-2 cursor-pointer"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8">
        <Link href="/" className="text-sm font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>
          <span className="text-blue-600">Trust</span>wall
        </Link>
      </div>
    </div>
  )
}
