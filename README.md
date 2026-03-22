# Trustwall

**Collect, manage, and embed customer testimonials in minutes.**

Trustwall is a SaaS testimonial management platform that helps businesses and founders collect written (and video) customer testimonials, moderate them, and embed them on their websites as social proof — all in under 5 minutes.

## How It Works

1. **Create a Space** — set up a branded testimonial collection page
2. **Share the Link** — customers fill out a simple feedback form (no login required)
3. **Approve the Best** — review, tag, and approve testimonials from your dashboard
4. **Embed Anywhere** — copy a code snippet and display live testimonials on your website

## Features

### Core
- Clerk authentication (Google + email)
- Create and manage multiple branded spaces
- Public testimonial collection form with star ratings
- Approve, reject, and favorite testimonials
- Embeddable widgets (Wall Grid, Carousel, Minimal List, Rating Badge)
- Stripe billing with Free / Starter / Pro tiers

### Growth & Engagement
- Public **Wall of Love** page — shareable testimonial gallery
- **Request templates** — pre-written messages for Email, WhatsApp, LinkedIn
- **QR code generator** — scannable code for print materials
- **Social media image generator** — OG-style shareable images from testimonials
- **In-app notifications** — bell icon with pending review count
- **Analytics** — form views, submissions, conversion rate per space

### Advanced
- **Auto-approve rules** — set a minimum star rating to skip manual review
- **AI highlights** — auto-generate a one-line summary from testimonial text
- **Testimonial tags** — organize by category or product
- **Video testimonials** — paste YouTube, Loom, or Vimeo links
- **Multi-language detection** — auto-detect language on submission
- **Rich form fields** — optional company logo and social profile links
- **Custom thank-you page** — editable message + optional redirect URL
- **CSV import** (Pro) — bulk-import testimonials from spreadsheets

### Plan Gating

| Feature | Free | Starter ($9/mo) | Pro ($29/mo) |
|---------|------|-----------------|--------------|
| Spaces | 1 | 3 | Unlimited |
| Testimonials/space | 10 | Unlimited | Unlimited |
| Widget styles | 2 | All | All |
| Branding removal | - | Yes | Yes |
| CSV Import | - | - | Yes |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Auth**: Clerk
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Payments**: Stripe (Checkout, Customer Portal, Webhooks)
- **Styling**: Tailwind CSS with glassmorphism effects
- **Language**: TypeScript

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Clerk account
- Stripe account

### Setup

```bash
# Clone the repo
git clone https://github.com/Parthverma2409/trustwall-saas.git
cd trustwall-saas

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your Clerk, Stripe, and database credentials in .env

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

See `.env.example` for all required variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`
- `DATABASE_URL` / `DIRECT_URL`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- `STRIPE_STARTER_PRICE_ID` / `STRIPE_PRO_PRICE_ID`
- `NEXT_PUBLIC_APP_URL`

## Project Structure

```
src/
  app/
    (dashboard)/          # Authenticated dashboard pages
      dashboard/          # Spaces list, billing
        spaces/[spaceId]/ # Space detail, embed, request, settings
    api/                  # API routes (spaces, testimonials, billing, widgets)
    t/[slug]/             # Public testimonial collection form
    wall/[slug]/          # Public Wall of Love page
    powered-by/           # Conversion landing page
  lib/                    # Utilities (plans, validations, Stripe, Prisma, etc.)
prisma/
  schema.prisma           # Database schema
```

## Deployment

Deploy to [Vercel](https://vercel.com):

1. Push to GitHub
2. Import the repo on Vercel
3. Add all environment variables
4. Set up Stripe webhook endpoint: `https://yourdomain.com/api/webhook`
5. Update Clerk allowed redirect URLs for your production domain

## License

MIT
