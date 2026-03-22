'use client'

import Link from 'next/link'
import { SignUpButton, SignInButton, useUser } from '@clerk/nextjs'
import {
  PenLine,
  CheckCircle2,
  LayoutGrid,
  Palette,
  BarChart3,
  Shield,
  Star,
  ArrowRight,
  Menu,
} from 'lucide-react'
import { useState } from 'react'

const FEATURES = [
  {
    icon: PenLine,
    title: 'Collect Effortlessly',
    desc: 'Share a simple link. Customers fill a beautiful branded form. Testimonials arrive in your dashboard.',
  },
  {
    icon: CheckCircle2,
    title: 'Approve & Curate',
    desc: 'Review submissions, approve the best ones, star your favorites, and reject the rest.',
  },
  {
    icon: LayoutGrid,
    title: 'Embed Anywhere',
    desc: 'Wall, carousel, or minimal — copy one snippet and paste it into any website. Updates live.',
  },
  {
    icon: Palette,
    title: 'Brand Everything',
    desc: 'Custom colors, logos, and thank-you messages. Your testimonial page, your brand.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Analytics',
    desc: "Track how many testimonials you've received, approval rates, and average ratings at a glance.",
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    desc: 'Authentication, role-based access, and encrypted database. Your data stays yours.',
  },
]

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    desc: 'Perfect for side projects',
    features: ['1 space', '10 testimonials', '1 widget style', 'Trustwall branding'],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Starter',
    price: '$9',
    desc: 'For growing businesses',
    features: ['3 spaces', 'Unlimited testimonials', 'All widget styles', 'No branding'],
    cta: 'Start Starter',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '$29',
    desc: 'For agencies & power users',
    features: ['Unlimited spaces', 'Unlimited testimonials', 'All widget styles', 'No branding', 'Custom CSS', 'Import from CSV'],
    cta: 'Go Pro',
    highlighted: false,
  },
]

const TESTIMONIALS = [
  {
    text: 'Trustwall replaced our clunky spreadsheet of customer quotes. Collecting and displaying testimonials is now a 2-minute task.',
    name: 'Priya Sharma',
    title: 'Founder, DesignDock',
    rating: 5,
  },
  {
    text: 'The embed widget looks native on our marketing site. Our conversion rate on the pricing page went up 22% after adding it.',
    name: 'Alex Chen',
    title: 'Head of Growth, Relay',
    rating: 5,
  },
  {
    text: "I love that I can share a link and customers just fill it out. No more back-and-forth emails asking for testimonials.",
    name: 'Marcus Johnson',
    title: 'CEO, LoopHQ',
    rating: 5,
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < count ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isSignedIn } = useUser()

  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ fontFamily: "'Open Sans', system-ui, sans-serif" }}>

      {/* ─── HEADER ─── */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <span className="text-blue-600">Trust</span>wall
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors duration-200 cursor-pointer">Features</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors duration-200 cursor-pointer">Pricing</a>
            <a href="#testimonials" className="hover:text-slate-900 transition-colors duration-200 cursor-pointer">Wall of Love</a>
            {isSignedIn ? (
              <Link href="/dashboard" className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-sm cursor-pointer">
                Dashboard
              </Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="hover:text-slate-900 transition-colors duration-200 cursor-pointer">Log in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-sm cursor-pointer">
                    Get Started Free
                  </button>
                </SignUpButton>
              </>
            )}
          </nav>
          <button
            className="md:hidden p-2 cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-3">
            <a href="#features" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200">Features</a>
            <a href="#pricing" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200">Pricing</a>
            <a href="#testimonials" className="block text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200">Wall of Love</a>
            {isSignedIn ? (
              <Link href="/dashboard" className="block w-full bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold text-center cursor-pointer">
                Dashboard
              </Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="block text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200 cursor-pointer">Log in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer">
                    Get Started Free
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        )}
      </header>

      {/* ─── HERO ─── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Social proof that converts
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Collect & showcase <br />
            <span className="text-blue-600">
              customer testimonials
            </span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
            Share a link, collect written testimonials, curate the best ones, and embed a beautiful
            widget on your website — all in under 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isSignedIn ? (
              <Link href="/dashboard" className="bg-blue-600 text-white px-8 py-3.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all duration-200 shadow-sm hover:-translate-y-0.5 cursor-pointer">
                Go to Dashboard
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <button className="bg-blue-600 text-white px-8 py-3.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all duration-200 shadow-sm hover:-translate-y-0.5 cursor-pointer">
                  Start Collecting — It&apos;s Free
                </button>
              </SignUpButton>
            )}
            <a href="#features" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors duration-200 flex items-center gap-1 cursor-pointer">
              See how it works <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Fake browser preview */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 ml-3 bg-slate-800 rounded-md px-3 py-1 text-slate-500 text-xs">
                trustwall.app/dashboard
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-slate-800 rounded-xl p-4 text-left">
                  <Stars count={t.rating} />
                  <p className="text-slate-300 text-xs mt-2 leading-relaxed">&ldquo;{t.text.slice(0, 100)}...&rdquo;</p>
                  <p className="text-slate-500 text-[10px] mt-3 font-medium">{t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold" style={{ fontFamily: "'Poppins', sans-serif" }}>Everything you need to win trust</h2>
            <p className="text-slate-500 mt-3">From collection to conversion, we&apos;ve got you covered.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-base font-bold mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-16" style={{ fontFamily: "'Poppins', sans-serif" }}>Three steps to social proof</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: '01', title: 'Create a Space', desc: 'Set your brand name, color, and collection link.' },
              { step: '02', title: 'Share the Link', desc: 'Customers visit your branded form and leave a testimonial.' },
              { step: '03', title: 'Embed the Widget', desc: 'Copy one snippet. Approved testimonials appear instantly.' },
            ].map((s) => (
              <div key={s.step}>
                <div className="text-4xl font-black text-blue-100 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.step}</div>
                <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WALL OF LOVE ─── */}
      <section id="testimonials" className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold" style={{ fontFamily: "'Poppins', sans-serif" }}>Loved by founders</h2>
            <p className="text-slate-500 mt-3">Here&apos;s what our early users say about Trustwall.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <Stars count={t.rating} />
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold" style={{ fontFamily: "'Poppins', sans-serif" }}>Simple, transparent pricing</h2>
            <p className="text-slate-500 mt-3">Start free. Upgrade when you&apos;re ready.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl p-7 border-2 transition-all duration-200 ${
                  p.highlighted
                    ? 'border-blue-500 bg-blue-50/40 shadow-lg scale-[1.02]'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                {p.highlighted && (
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Most Popular</div>
                )}
                <h3 className="text-lg font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>{p.name}</h3>
                <p className="text-xs text-slate-400 mb-3">{p.desc}</p>
                <div className="mb-5">
                  <span className="text-4xl font-extrabold" style={{ fontFamily: "'Poppins', sans-serif" }}>{p.price}</span>
                  <span className="text-slate-400 text-sm">/mo</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                {isSignedIn ? (
                  <Link
                    href="/dashboard"
                    className={`block w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-colors duration-200 cursor-pointer ${
                      p.highlighted
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <SignUpButton mode="modal">
                    <button
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                        p.highlighted
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {p.cta}
                    </button>
                  </SignUpButton>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Ready to build trust?</h2>
          <p className="text-blue-200 mb-8">Start collecting testimonials today. No credit card required.</p>
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center bg-white text-blue-700 px-8 py-3.5 rounded-full text-sm font-bold hover:bg-blue-50 transition-all duration-200 shadow-sm hover:-translate-y-0.5 cursor-pointer"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button className="bg-white text-blue-700 px-8 py-3.5 rounded-full text-sm font-bold hover:bg-blue-50 transition-all duration-200 shadow-sm hover:-translate-y-0.5 cursor-pointer">
                Get Started Free <ArrowRight className="w-4 h-4 inline ml-1" />
              </button>
            </SignUpButton>
          )}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-10 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <span className="text-blue-600">Trust</span>wall
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-slate-600 transition-colors duration-200 cursor-pointer">Features</a>
            <a href="#pricing" className="hover:text-slate-600 transition-colors duration-200 cursor-pointer">Pricing</a>
            <Link href="/dashboard" className="hover:text-slate-600 transition-colors duration-200 cursor-pointer">Dashboard</Link>
          </div>
          <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} Trustwall. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
