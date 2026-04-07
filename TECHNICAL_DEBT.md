# Technical Debt Register — BISXP.com
_Last updated: 2026-04-07 Session 1_

---

## Priority 1 — Critical (address within next 2 sessions)

### 1.1 No test suite
- **Current state**: Zero tests. No Vitest config. No unit tests. No integration tests.
- **Impact**: Every feature ships without verification. Regressions go undetected.
- **Fix**: Install Vitest, write unit tests for both enquiry API routes, write integration test for enquiry DB write
- **Effort**: Medium (2–3 hours)
- **Blocks**: Everything. No feature should ship without tests going forward.

### 1.2 page.tsx is ~1400 lines
- **Current state**: `app/page.tsx` contains all 10 homepage sections inline (~1400 lines)
- **Impact**: Violates the 500-line rule. Hard to maintain, impossible to test sections individually.
- **Fix**: Extract each section to `app/components/sections/` — HeroSection, StatsSection, AcronymSection, PortfolioSection, ServicesSection, ProcessSection, MarqueeSection, ContactSection, FooterSection
- **Effort**: Medium (2–3 hours)
- **Risk**: Low — pure refactor, zero behavior change

### 1.3 No develop branch / CI pipeline
- **Current state**: All work committed to `master` directly. No GitHub Actions.
- **Impact**: No automated TypeScript check, no test runner, no build validation before deploy.
- **Fix**:
  1. Create `develop` branch from current master
  2. Create `.github/workflows/ci.yml` — TypeScript check + tests on every push
  3. Enable branch protection on `main` in GitHub settings
- **Effort**: Low (1 hour)

### 1.4 No FEATURE.md process
- **Current state**: Session 1 built without FEATURE.md gate.
- **Impact**: No design review, no SOLID audit, no test plan before building.
- **Fix**: Create `docs/features/` directory with FEATURE-TEMPLATE.md. All future features require FEATURE.md first.
- **Effort**: Low (30 minutes)

---

## Priority 2 — Important (address within next 5 sessions)

### 2.1 bisxp.com domain not connected
- **Current state**: Site lives at `bisxp-com.vercel.app`
- **Impact**: Not professional. Can't share the URL publicly.
- **Fix**: Vercel → Settings → Domains → Add bisxp.com → update GoDaddy DNS records
- **Effort**: Low (30 minutes + DNS propagation time)

### 2.2 hello@bisxp.com not verified in Resend
- **Current state**: RESEND_FROM_EMAIL is set but bisxp.com domain not verified in Resend
- **Impact**: All enquiry email notifications will fail silently (enquiry still saves to DB)
- **Fix**: Resend → Domains → Add bisxp.com → add SPF/DKIM/DMARC records in GoDaddy
- **Effort**: Low (30 minutes + DNS propagation time)

### 2.3 No OG image
- **Current state**: No `/api/og` route for dynamic social sharing image
- **Impact**: Links shared on LinkedIn/Twitter show no preview image
- **Fix**: Create `app/api/og/route.ts` using Next.js ImageResponse — BISXP logo + tagline on dark background
- **Effort**: Low (1 hour)

### 2.4 No sitemap.xml or robots.txt
- **Current state**: Search engines have no sitemap guidance
- **Impact**: Slower indexing by Google
- **Fix**: Add `app/sitemap.ts` and `app/robots.ts` (Next.js 16 static file conventions)
- **Effort**: Low (30 minutes)

### 2.5 Admin dashboard has no notes field
- **Current state**: Enquiry status can be cycled but no free-text notes can be added
- **Impact**: Can't record call notes, follow-up reminders, or context per enquiry
- **Fix**: Add notes textarea to expanded enquiry row. PATCH endpoint already supports notes field.
- **Effort**: Low (1 hour)

### 2.6 No rate limiting on enquiry endpoint
- **Current state**: `/api/enquiry` is publicly accessible with no rate limiting
- **Impact**: Spam enquiries, abuse, unnecessary Resend API calls
- **Fix**: Add Vercel Edge rate limiting or Upstash Redis rate limiter
- **Effort**: Medium (2 hours)

---

## Priority 3 — Nice to Have

### 3.1 No hello@bisxp.com inbox
- **Current state**: Resend can send FROM hello@bisxp.com but there's no inbox to RECEIVE replies
- **Impact**: Clients who reply to enquiry confirmation emails get no response
- **Fix**: Google Workspace ($6/mo) or Zoho Mail (free) for actual inbox
- **Effort**: Low (1 hour setup)

### 3.2 No blog / case studies section
- **Current state**: No content marketing
- **Impact**: No SEO content, no social proof beyond two portfolio cards
- **Fix**: Add blog when 3+ case studies exist. Don't add an empty blog.
- **Effort**: High (5+ hours) — defer until content exists

### 3.3 No Google Analytics / Plausible
- **Current state**: No visitor tracking
- **Impact**: Can't measure conversion rate (visitors → enquiries)
- **Fix**: Add Plausible (privacy-friendly, $9/mo) or Google Analytics (free)
- **Effort**: Low (30 minutes)

### 3.4 Contact form missing WhatsApp redirect option
- **Current state**: WhatsApp button exists as FAB only
- **Impact**: Some users prefer WhatsApp over form
- **Fix**: Add "Or contact us on WhatsApp" as a secondary CTA below the submit button with direct wa.me link
- **Already done in current form** — verify it's visible on mobile

### 3.5 No structured data (JSON-LD)
- **Current state**: No Organisation schema on homepage
- **Impact**: Missing rich snippets in Google results
- **Fix**: Add Organisation + WebSite JSON-LD schema
- **Effort**: Low (30 minutes)

---

## Cleared Debt

_Nothing cleared yet — Session 1 was the foundation._

---

_This file is updated by Claude Code at each session._
_Priority levels: 1 = critical (next 2 sessions), 2 = important (next 5 sessions), 3 = nice to have._
_Human-editable for adding new debt items discovered outside Claude Code sessions._
