'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { LayoutGrid, CreditCard, Menu, X, Plus, Bell } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Spaces', icon: LayoutGrid },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
]

interface NotifItem {
  id: string
  authorName: string
  preview: string
  spaceName: string
  spaceId: string
  createdAt: string
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const [notifItems, setNotifItems] = useState<NotifItem[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchNotifs = () => {
      fetch('/api/notifications')
        .then(r => r.json())
        .then(data => {
          setNotifCount(data.count || 0)
          setNotifItems(data.items || [])
        })
        .catch(() => {})
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50" style={{ fontFamily: "'Open Sans', system-ui, sans-serif" }}>
      {/* Top Nav - Glass Effect */}
      <nav className="glass-strong sticky top-0 z-40 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <span className="text-blue-600">Trust</span>wall
              </Link>
              <div className="hidden sm:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer',
                      (pathname === item.href || (item.href === '/dashboard' && pathname.startsWith('/dashboard/spaces')))
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/spaces/new"
                className="hidden sm:flex px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> New Space
              </Link>

              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 text-slate-600 hover:bg-white/80 rounded-lg transition-colors cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px] shadow-sm">
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 glass-strong rounded-2xl shadow-xl border border-slate-200/60 z-50 animate-scale-in overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200/60">
                      <p className="text-sm font-semibold text-slate-900">Pending Reviews</p>
                      <p className="text-xs text-slate-400">{notifCount} awaiting approval</p>
                    </div>
                    {notifItems.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-slate-400">
                        No pending testimonials
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto">
                        {notifItems.map(item => (
                          <Link
                            key={item.id}
                            href={`/dashboard/spaces/${item.spaceId}`}
                            onClick={() => setNotifOpen(false)}
                            className="block px-4 py-3 hover:bg-white/60 transition-colors border-b border-slate-100 last:border-0 cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-slate-900">{item.authorName}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1">{item.preview}</p>
                            <p className="text-[10px] text-blue-500 mt-1">{item.spaceName}</p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <UserButton />
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="sm:hidden p-2 text-slate-600 hover:bg-white/80 rounded-lg transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-slate-200/60 px-4 py-3 space-y-1 animate-fade-in-up">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 cursor-pointer',
                  (pathname === item.href || (item.href === '/dashboard' && pathname.startsWith('/dashboard/spaces')))
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-white/80'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            <Link
              href="/dashboard/spaces/new"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors duration-200 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Space
            </Link>
          </div>
        )}
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
