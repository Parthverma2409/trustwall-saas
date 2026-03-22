# Implementation Plan — Time-Off Compliance SaaS (India)

## Tech Stack (SaaS MVP Best Practices)
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes + tRPC
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: Clerk (social login, session management)
- **Payments**: Stripe (subscriptions, simple checkout)
- **Email**: Resend
- **Deployment**: Vercel (frontend + backend)
- **File storage**: Vercel Blob or AWS S3 (for PDFs/Excels)

## Phase 0: Reporting-Only MVP (Week 1-2)

### Step 1: Project Setup (Day 1) ✓ DONE
- [x] Create Next.js 15 project with TypeScript
- [x] Set up Tailwind CSS + shadcn/ui
- [x] Configure environment variables (.env.local)
- [x] Set up Supabase project + PostgreSQL

### Step 2: Database Schema (Day 1-2) ✓ DONE
- [x] Create Prisma schema:
  - Company (id, name, plan, timezone)
  - LeavePolicy (id, companyId, policyName, leaveTypes JSON)
  - Employee (id, name, email, companyId)
  - LeaveRecord (id, employeeId, leaveType, startDate, endDate, days, status)
  - UploadLog (id, companyId, uploadedAt, recordCount, errors)
- [x] Run migrations: `prisma migrate dev`

### Step 3: Auth Setup (Day 2) ✓ DONE
- [x] Create Clerk account + configure app
- [x] Add Clerk middleware to Next.js
- [x] Create auth pages (signup, login, logout)
- [x] Protect admin routes with auth guards

### Step 4: Admin Dashboard - Policy Setup (Day 3) ✓ IN PROGRESS
- [x] Create `/dashboard` page (protected) with quick action cards
- [x] Build form to:
  - Define leave types (Casual Leave, Sick Leave, Earned Leave, etc.) - UI ready
  - Set accrual per month per type - UI ready
  - Set carry-forward limits - UI ready
  - Save to LeavePolicy - API needs completion
- [ ] Display current policy (read/edit controls)

### Step 5: CSV Upload & Validation (Day 3-4) ✓ IN PROGRESS
- [x] Create `/dashboard/upload` page with enhanced UX
- [x] CSV schema validation logic (ready)
- [x] Store validated records in LeaveRecord table - API needs implementation
- [x] Display validation errors/warnings to user

### Step 6: Report Generator (Day 4-5) ⏳ NEXT
- [ ] Build report logic to compute:
  - Current balance per employee per leave type
  - Leave taken by month
  - Carry-forward and accrual calculations
  - Flags for negative balances or policy violations
- [ ] Add PDF export (use `jspdf` + `html2canvas` or `pdfkit`)
- [ ] Add Excel export (use `exceljs`)
- [ ] Store generated report metadata in database

### Step 7: MVP Landing Page (Day 5)
- [ ] Create landing page with:
  - Problem statement
  - Benefits
  - Pricing (INR 2k-5k)
  - CTA to signup
  - FAQ section

### Step 8: Basic Styling & UX (Day 5-6)
- [ ] Polish dashboard with shadcn/ui components
- [ ] Add form validation
- [ ] Add success/error toasts
- [ ] Mobile responsiveness

**Milestone**: Reporting-only MVP ready for user testing.

---

## Phase 1: Self-Service Balances (Week 3-5)

### Step 9: Employee Portal Auth (Day 7)
- [ ] Create shareable employee access flow (email link or separate login)
- [ ] Implement role-based access (admin vs employee view)

### Step 10: Employee Balance View (Day 8-9)
- [ ] Create `/employee/balances` page
- [ ] Display current balance per leave type
- [ ] Show accrual history
- [ ] Add simple download (PDF personal statement)

**Milestone**: Employees can view their balances.

---

## Phase 2: Concierge Option (Week 6-8)

### Step 11: Billing Setup (Day 10-11)
- [ ] Create Stripe account
- [ ] Set up Stripe products and pricing
- [ ] Implement Stripe webhook handlers (subscription events)
- [ ] Create billing dashboard

### Step 12: Subscription Management (Day 12-13)
- [ ] Add "Upgrade to Concierge" button in dashboard
- [ ] Create checkout flow (Stripe)
- [ ] Store subscription data (stripeCustomerId, stripePriceId, status)

**Milestone**: Billing operational; first paid customers viable.

---

## Phase 3: Pre-Launch Checklist

### Technical
- [ ] Basic security: auth tested, TLS enforced, role-based access working
- [ ] Database backups configured (automated daily)
- [ ] Error logging (Sentry or similar)
- [ ] Monitoring setup (uptime, performance)
- [ ] Environment variables secured (.env.local, never committed)
- [ ] Rate limiting on API routes
- [ ] Input validation on all forms (Zod)
- [ ] HTTPS enforced

### Product
- [ ] Landing page live
- [ ] Terms of Service + Privacy Policy
- [ ] Support channel (email or chat)
- [ ] Onboarding flow (first user walkthrough)

### Go-to-Market
- [ ] Identify 5-10 target founders in local groups
- [ ] Draft cold message/email
- [ ] Prepare demo video or screenshots
- [ ] Create 7-day free trial or "first report free" offer

---

## Architecture Overview
```
Next.js App
├── /app
│   ├── (auth)/ => Clerk handled
│   ├── (dashboard)/ => admin routes (company, policy, upload, reports)
│   ├── (employee)/ => /balances, /download
│   ├── (marketing)/ => landing page
│   └── /api => tRPC routes for data fetching
├── /lib
│   ├── db.ts => Prisma client
│   ├── csv-parser.ts => upload validation + parsing
│   ├── report-generator.ts => balance calc + export logic
│   ├── stripe.ts => payment client
│   └── email.ts => Resend client
├── /components => shadcn/ui + custom components
├── prisma/
│   └── schema.prisma => data model
└── .env.local => secrets (Clerk, Stripe, Supabase, etc.)
```

---

## Timeline Summary
- **Days 1-6**: Phase 0 (reporting MVP)
- **Days 7-9**: Phase 1 (employee self-service)
- **Days 10-13**: Phase 2 (billing + concierge setup)
- **Days 14-21**: Polish, testing, pre-launch checklist
- **Day 22+**: Launch to founder communities

---

## Success Metrics (First Month)
- [ ] 1–2 paid customers signed up
- [ ] INR 2k-10k MRR
- [ ] CSS/CSV upload without errors
- [ ] Reports generated and downloaded
- [ ] 99.9% uptime achieved
- [ ] Zero critical security issues
