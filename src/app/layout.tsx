import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trustwall — Collect & Embed Testimonials in Minutes',
  description: 'The simplest way to collect customer testimonials and showcase them on your website. Free to start, embed anywhere.',
  keywords: ['testimonials', 'social proof', 'reviews', 'customer feedback', 'embed testimonials'],
  openGraph: {
    title: 'Trustwall — Collect & Embed Testimonials',
    description: 'The simplest way to collect and showcase customer testimonials.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
