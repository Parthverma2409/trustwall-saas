# Testimonial Collector SaaS — Design Document

## Understanding Summary
- **What**: A SaaS that lets freelancers, agencies, and SaaS founders collect text testimonials from clients via a shareable link and embed them on their website with a copy-paste widget
- **Why**: Every business needs social proof; existing tools (Senja $24/mo, Testimonial.to $50/mo) are overpriced for small businesses
- **Who**: Global market — freelancers, indie hackers, small agencies, SaaS founders
- **Timeline**: 7–10 days full-time to MVP launch
- **Budget**: $0 running costs (Vercel free, Supabase free, Clerk free tier)
- **Non-goals**: Video testimonials (v1), AI features, enterprise sales, mobile app

## Assumptions
- Reuse existing tech stack: Next.js 14 + Clerk + Stripe + Prisma + Supabase
- Marketing via free channels: Reddit, X/Twitter, Product Hunt, Indie Hackers
- Free tier drives signups → conversion to paid at ~5-10%
- Embeddable widget is the key retention mechanism (sticky once installed)
- No custom domains in v1

## Core User Flow
1. **Sign up** → Clerk auth (Google/email)
2. **Create a Space** → Name your brand/project, upload logo, customize colors
3. **Share collection link** → Send `yourdomain.com/t/your-brand` to clients
4. **Clients submit** → Name, photo (optional), rating (1-5 stars), text testimonial
5. **Review in dashboard** → Approve, reject, or favorite testimonials
6. **Embed on website** → Copy a `<script>` tag, testimonials appear automatically
7. **Upgrade to paid** → More spaces, remove branding, unlock styles

## Architecture

### Route Structure
```
Next.js App
├── /                         → Marketing landing page
├── /dashboard                → User's spaces overview
├── /dashboard/[spaceId]      → Manage testimonials for a space
├── /dashboard/[spaceId]/embed → Get embed code + preview
├── /dashboard/billing        → Stripe subscription management
├── /t/[slug]                 → Public testimonial submission form
├── /api/spaces/              → CRUD for spaces
├── /api/testimonials/        → CRUD + approve/reject
├── /api/widget/[spaceId]     → JSON endpoint for embed widget
└── /embed.js                 → Static JS widget (served from /public)
```

### Data Model (Prisma)
```prisma
model Space {
  id          String        @id @default(cuid())
  userId      String        // Clerk user ID
  name        String
  slug        String        @unique
  logo        String?
  primaryColor String       @default("#6366f1")
  thankYouMsg  String       @default("Thank you for your testimonial!")
  createdAt   DateTime      @default(now())
  testimonials Testimonial[]
}

model Testimonial {
  id          String   @id @default(cuid())
  spaceId     String
  space       Space    @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  authorName  String
  authorEmail String?
  authorTitle String?  // e.g., "CEO at Acme"
  authorPhoto String?  // URL
  text        String
  rating      Int      @default(5) // 1-5
  status      String   @default("pending") // pending | approved | rejected
  isFavorite  Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Subscription {
  id              String   @id @default(cuid())
  userId          String   @unique
  stripeCustomerId String?
  stripePriceId   String?
  status          String   @default("free") // free | active | cancelled
  plan            String   @default("free") // free | starter | pro
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Embed Widget
- A lightweight `<script>` tag users paste into their HTML
- Fetches approved testimonials from `/api/widget/[spaceId]`
- Renders in an iframe or shadow DOM (avoids CSS conflicts)
- Multiple display styles: **Wall of Love** (grid), **Carousel** (sliding), **Minimal List**
- Shows "Powered by [YourBrand]" on free tier (removed on paid)

## Pricing

| Plan | Price | Limits |
|---|---|---|
| **Free** | $0/month | 1 space, 10 testimonials, "Powered by" badge, 1 widget style |
| **Starter** | $9/month | 3 spaces, unlimited testimonials, remove branding, all widget styles |
| **Pro** | $29/month | Unlimited spaces, custom CSS, priority support, import from CSV |

## Key Pages

### Landing Page
- Hero: "Collect and showcase testimonials in minutes"
- Demo widget showing real-looking testimonials
- 3-step "How it works" section
- Pricing table
- CTA: "Start collecting for free"

### Public Collection Form (`/t/[slug]`)
- Clean, minimal form
- Brand logo + colors from space settings
- Fields: Name, Title/Company (optional), Rating (stars), Your Testimonial
- Photo upload (optional, stored as base64 or Supabase storage)
- Thank-you screen after submit

### Dashboard
- List of spaces with testimonial counts
- Per-space view: testimonials table with approve/reject/favorite actions
- Embed tab: preview widget + copy code button
- Billing tab: current plan, upgrade button

## Security & Reliability
- Auth via Clerk (free tier: 10K MAUs)
- Rate limiting on public form (prevent spam)
- Data scoped by userId (users only see their own spaces)
- Supabase free tier: 500MB database, 1GB storage
- TLS enforced via Vercel

## Go-to-Market
- **Week 1**: Launch on Indie Hackers, Reddit (r/SaaS, r/webdev, r/Entrepreneur)
- **Week 2**: Product Hunt launch
- **Ongoing**: Post testimonial collection tips on X/Twitter
- **Pitch**: "Stop losing clients because you have no social proof. Collect and embed testimonials in 2 minutes. Free."

## Decision Log

| # | Decision | Alternatives Considered | Rationale |
|---|---|---|---|
| 1 | Pivot from Time-Off SaaS to Testimonial Collector | Continue Time-Off, Waitlist Builder, Invoice Generator | Testimonials have highest demand, stickiness, and pricing power with zero API costs |
| 2 | Text-only testimonials for v1 (no video) | Video testimonials from day 1 | Video adds complexity (file storage, encoding); text is sufficient for MVP |
| 3 | Widget renders via fetched JSON + client-side JS | Server-rendered iframe, static export | Client-side JS is simplest, avoids server load, works on any site |
| 4 | Free tier with 10 testimonials | No free tier, freemium with 3 testimonials | 10 is generous enough to be useful, drives word-of-mouth; "Powered by" badge = free marketing |
| 5 | Reuse existing Next.js + Clerk + Stripe + Prisma stack | Start fresh with different stack | Saves 1-2 days of setup; already proven working |
| 6 | Supabase free tier for storage | AWS S3, Cloudflare R2 | Zero cost; sufficient for MVP scale (500MB DB, 1GB files) |
| 7 | Shadow DOM for widget isolation | iframe embed, direct DOM injection | Shadow DOM avoids CSS conflicts without iframe performance overhead |

## Risks
- **Low initial traffic**: Mitigated by free-tier virality ("Powered by" badge links back to your site)
- **Spam on public forms**: Mitigated by rate limiting + optional email confirmation
- **Supabase free tier limits**: 500MB DB is enough for ~100K testimonials; upgrade if growth happens
