# BISXP.com — Platform Bible
_The standing engineering manual for every Claude Code session on bisxp-com._
_Adapted from TABRO.IN BISXP-CLAUDE.md — same discipline, simpler stack._
_Last updated: 2026-04-07 Session 1_

---

## Table of Contents

1. [SESSION START](#1-session-start)
2. [SESSION END](#2-session-end)
2A. [PER-FEATURE SOLID CHECKPOINT](#2a-per-feature-solid-checkpoint)
3. [BUILD SEQUENCE](#3-build-sequence)
4. [AUTH ARCHITECTURE](#4-auth-architecture)
5. [DATABASE PATTERNS](#5-database-patterns)
6. [API ROUTE PATTERNS](#6-api-route-patterns)
7. [CSS PATTERNS](#7-css-patterns)
8. [EMAIL SETUP](#8-email-setup)
9. [MOBILE-FIRST](#9-mobile-first)
10. [NEXT.JS SPECIFICS](#10-nextjs-specifics)
11. [TESTING DISCIPLINE + TDD](#11-testing-discipline--tdd)
12. [BUILD SESSION STRATEGY](#12-build-session-strategy)
13. [ENVIRONMENT SETUP](#13-environment-setup)
14. [COMMON MISTAKES](#14-common-mistakes)
15. [SEO PATTERNS](#15-seo-patterns)
16. [SCALE THRESHOLDS](#16-scale-thresholds)
17. [DISTINGUISHED ENGINEER MINDSET](#17-distinguished-engineer-mindset)
18. [GLOSSARY](#18-glossary)
19. [CLAUDE.AI + CLAUDE CODE FEEDBACK LOOP](#19-claudeai--claude-code-feedback-loop)

---

## 1. SESSION START

**Every session begins with these 4 steps. No exceptions. No shortcuts.**

### Step 1: Read Context (mandatory)
Before writing ANY code, read these files in order:

1. **`CLAUDE_CONTEXT.md`** — the living truth of what exists
2. **`BISXP-CLAUDE.md`** (this file) — the engineering manual
3. **`TECHNICAL_DEBT.md`** — known debt, do not add more without documenting
4. **`SESSION_OBSERVATIONS.md`** — degradation signals from prior sessions
5. **`.claude/CLAUDE.md`** — project-level standing rules

### Step 2: Produce SESSION START REPORT

```
═══ SESSION START REPORT ═══
Session: [N] — [Date]
Branch: [current branch]
Tests passing: [run npm test, report count]
TypeScript: [run npx tsc --noEmit, report clean or error count]
Files over 500 lines: [list any, or "None"]
Last session summary: [1-line from SESSION_OBSERVATIONS.md]
Debt items: [count from TECHNICAL_DEBT.md]
Task for this session: [what Shah asked for]
═══════════════════════════
```

### Step 3: FEATURE.md Gate
If this session involves building a new feature:
- Check `docs/features/` for an approved FEATURE.md
- If none exists, **STOP and tell Shah** — no feature work without FEATURE.md
- Escape hatches: bug fixes, test-only, docs/CI-only, hotfixes (see SESSION_CONTRACT.md)

### Step 4: Pre-Flight Checks
```bash
git pull origin develop
npm test
npx tsc --noEmit
```

If either check fails, fix before proceeding or report to Shah.

---

## 2. SESSION END

Every session produces **three artifacts** before the final commit. No exceptions.

### Artifact 1: Updated `CLAUDE_CONTEXT.md`
- New database tables and columns added
- New API routes created
- New pages and components added
- Updated pending backlog
- Update the `_Last updated` line

### Artifact 2: Updated `SESSION_OBSERVATIONS.md`
Add a new observation block — see Section 19 for template.

### Artifact 3: SESSION OBSERVATION BLOCK

```
═══ SESSION OBSERVATION BLOCK ═══
Session: [N] — [Date]
Duration: [approximate]
Files created: [count]
Files modified: [count]
Tests before: [count] | Tests after: [count] | Delta: [+/-N]
TypeScript: [clean or error count]
Files over 500 lines: [list any, or "None"]
Debt added: [count] | Debt resolved: [count]
═════════════════════════════════
```

### Final Verification
```bash
npm test              # all tests pass
npx tsc --noEmit      # no TypeScript errors
```

### Commit discipline
```bash
git add -A
git commit -m "type(scope): Session N — brief description"
git push origin develop
```

**Never push directly to `main`.** All work goes to `develop`, then PR to `main`.

### Commit message format
- `feat(admin): Session 2 — enquiry notes and status cycling`
- `fix(form): Session 3 — WhatsApp number validation`
- `refactor(api): Session 4 — extract shared auth helpers`
- `test(enquiry): Session 5 — integration tests for POST /api/enquiry`
- `ci(pipeline): Session 6 — GitHub Actions CI workflow`

---

## 2A. PER-FEATURE SOLID CHECKPOINT

Before opening a PR for any feature, complete this checkpoint.

```
═══ SOLID CHECKPOINT — [Feature Name] ═══

S — Single Responsibility
  [ ] Every new file does exactly one thing
  [ ] No file handles both data fetching and rendering
  [ ] API routes are thin (<80 lines), logic in lib/

O — Open/Closed
  [ ] Extended existing system without modifying working code
  [ ] No changes to unrelated files

L — Liskov Substitution
  [ ] Shared components receive consistent props interfaces

I — Interface Segregation
  [ ] No component receives props it does not use
  [ ] No "god object" props with 10+ fields

D — Dependency Inversion
  [ ] Business logic lives in lib/, not in routes or pages
  [ ] No direct Supabase calls in page components

═══════════════════════════════════════════
```

### Hard Stop Rules
These violations block merge. No exceptions:

1. **500-line rule** — any file exceeding 500 lines must be split before merge
2. **Test count drop** — test count must be >= previous session's count
3. **80-line route rule** — API routes over 80 lines must extract logic to `lib/`
4. **DIP violations** — page.tsx files must not contain raw Supabase queries

---

## 3. BUILD SEQUENCE

### Foundation (every feature, every time)
```
Schema change → Migration file → API route → Unit tests → UI → E2E test
```

Never skip steps. Never write UI before the API is tested.

### File creation order
1. `supabase/migrations/NNN_description.sql` — schema first
2. `lib/feature-name.ts` — business logic (if needed)
3. `app/api/feature/route.ts` — thin API route
4. `tests/unit/feature-api.test.ts` — tests immediately after route
5. `app/feature/page.tsx` — UI last
6. Update `CLAUDE_CONTEXT.md`

### Integration test requirement
For every API route that writes to the database, a corresponding
integration test must exist in `tests/integration/` before the
feature is marked complete. This is non-negotiable — it was established
after the TABRO Session 27 allowlist bug that required 3 production
deployments to fix.

---

## 4. AUTH ARCHITECTURE

### BISXP uses simple single-admin auth

Unlike TABRO (multi-role, multi-user), BISXP has exactly one auth model:

**Admin user** — one user created manually in Supabase dashboard.
No self-registration. No role system. No capability flags.

### Supabase client patterns

#### Browser client (client components)
```typescript
// Always wrap in useMemo() — never instantiate outside useMemo
import { createAuthClient } from '@/lib/supabase'
const supabase = useMemo(() => createAuthClient(), [])
```

#### Server client (API routes)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const cookieStore = await cookies()
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(list) {
        list.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options))
      }
    }
  }
)
// ALWAYS getUser() — NEVER getSession()
const { data: { user } } = await supabase.auth.getUser()
```

#### Service role client (RLS bypass)
```typescript
import { createClient } from '@supabase/supabase-js'
const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### Auth rule — never break this
```typescript
// CORRECT — verifies with server, cannot be spoofed
const { data: { user } } = await supabase.auth.getUser()

// WRONG — reads local storage, can be spoofed
const { data: { session } } = await supabase.auth.getSession()
```

### Middleware (proxy.ts)
- File is named `proxy.ts` not `middleware.ts` — Next.js 16 convention
- Export function named `proxy` not `middleware`
- Protects `/admin` — redirects to `/auth/login` if no user
- Public routes: `/`, `/auth/login`, `/auth/callback`, `/api/enquiry`

### Creating admin users
Admin users are created manually in Supabase dashboard:
Authentication → Users → Add user → email + password.
Never build a signup flow — this is intentional.

---

## 5. DATABASE PATTERNS

### Schema rules
1. **Only ADD** — never DROP, RENAME, or ALTER TYPE on existing columns
2. **New columns** — nullable or with DEFAULT value (never NOT NULL without default)
3. **Primary keys** — `uuid` with `gen_random_uuid()` default
4. **Timestamps** — `created_at timestamptz DEFAULT now()`, `updated_at timestamptz DEFAULT now()`
5. **Status columns** — use `CHECK` constraints with explicit allowed values
6. **Indexes** — on all frequently queried and filtered columns
7. **RLS** — enabled on all tables, always

### Migration template
```sql
-- Migration NNN: description
-- Date: YYYY-MM-DD
-- Session: N
-- Run in Supabase SQL Editor. Do NOT run again.

CREATE TABLE IF NOT EXISTS table_name (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'active', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_table_name_status ON table_name (status);
CREATE INDEX IF NOT EXISTS idx_table_name_created ON table_name (created_at DESC);

ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert" ON table_name FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin select" ON table_name FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin update" ON table_name FOR UPDATE USING (auth.role() = 'authenticated');
```

### BISXP tables
| Table | Purpose |
|-------|---------|
| `enquiries` | Contact form submissions with status pipeline |
| `profiles` | Admin user profile (one row, created manually) |

### Fan-out rule
When writing VIEWs that aggregate across tables, use correlated subqueries
instead of JOINs. JOINs across 1-to-many relationships multiply rows silently
and cause catastrophic performance bugs at scale.

```sql
-- BAD: fan-out
SELECT e.id, COUNT(r.id) FROM enquiries e LEFT JOIN related r ON r.enquiry_id = e.id GROUP BY e.id;

-- GOOD: correlated subquery
SELECT e.id, (SELECT COUNT(*) FROM related r WHERE r.enquiry_id = e.id) FROM enquiries e;
```

---

## 6. API ROUTE PATTERNS

### Thin route pattern
API routes must be < 80 lines. Business logic lives in `lib/`.

```typescript
// app/api/feature/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60  // always include

export async function POST(request: NextRequest) {
  // 1. Auth check (authenticated routes only)
  const cookieStore = await cookies()
  const authClient = createServerClient(/* ... */)
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Parse + validate
  const body = await request.json()
  if (!body.required_field) {
    return NextResponse.json({ error: 'required_field is required' }, { status: 400 })
  }

  // 3. Database operation (service role bypasses RLS)
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data, error } = await db.from('table').insert(body).select().single()
  if (error) return NextResponse.json({ error: 'DB error' }, { status: 500 })

  // 4. Return
  return NextResponse.json({ success: true, data })
}
```

### Dynamic route params
```typescript
// Next.js 16 — params are Promises
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // ...
}
```

### Never-do list for API routes
- Never use `getSession()` — always `getUser()`
- Never return raw Supabase errors to client
- Never use `export const config = {}` — Pages Router pattern, breaks App Router
- Never forget `export const maxDuration = 60`
- Never commit service role key
- Never create routes > 80 lines

---

## 7. CSS PATTERNS

### Non-negotiable rules
- **Never use Tailwind** — inline `<style>` tags with CSS variables only
- **Never hardcode hex colors** — always use CSS variables
- **Never use external CSS files** — all styles inline per page

### BISXP brand variables
```css
:root {
  --obsidian: #08080A;
  --charcoal: #131318;
  --steel: #1E1E26;
  --amber: #D4A843;
  --amber-bright: #F0C060;
  --amber-dim: rgba(212,168,67,0.15);
  --cream: #F0EBE0;
  --white: #FAFAF8;
  --muted: #70707A;
  --border: rgba(212,168,67,0.12);
  --border-strong: rgba(212,168,67,0.3);
}
```

### Font stack
```
Cormorant Garamond — headings (weight 300/400/600)
Outfit — body (weight 300/400/500/600)
```
Import: `https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap`

### CSS pattern (every page/component)
```tsx
export default function Page() {
  return (
    <>
      <style>{`
        .my-section {
          background: var(--obsidian);
          color: var(--cream);
          font-family: 'Outfit', sans-serif;
        }
        .my-heading {
          font-family: 'Cormorant Garamond', serif;
          color: var(--amber);
        }
      `}</style>
      <div className="my-section">
        <h1 className="my-heading">Title</h1>
      </div>
    </>
  )
}
```

### Three.js rule
**Never install three via npm.** Load via CDN in `useEffect` only.
Always use `dynamic(() => import(...), { ssr: false })` for Three.js components.

```typescript
// app/components/HeroCanvas.tsx — 'use client'
useEffect(() => {
  if (window.THREE) { initThree() } else {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
    script.onload = initThree
    document.head.appendChild(script)
  }
}, [])

// app/page.tsx
const HeroCanvas = dynamic(() => import('./components/HeroCanvas'), { ssr: false })
```

---

## 8. EMAIL SETUP

### Resend configuration
- **From address**: `hello@bisxp.com` (must be verified domain in Resend)
- **Domain**: `bisxp.com` added and verified in Resend → Domains
- **DNS records**: SPF, DKIM, DMARC added in GoDaddy
- **Inbox**: Separate from Resend — Resend is sending only
  (use Google Workspace or Zoho Mail for receiving at hello@bisxp.com)

### Email pattern
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
try {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'hello@bisxp.com',
    to: process.env.ADMIN_EMAIL!,
    replyTo: enquirer_email,
    subject: `New enquiry from ${name}`,
    html: `...branded HTML...`,
  })
} catch (emailError) {
  // Non-blocking — log but don't fail the request
  console.error('Email send error:', emailError)
}
```

### Critical rule
Email failure must never fail the user-facing request. Always wrap
in try/catch. The enquiry must be saved to the database regardless
of whether the email sends successfully.

---

## 9. MOBILE-FIRST

### Core principle
Build for 390px first. Add complexity for larger screens. Never retrofit.

### Required media queries (every page)
```css
@media (max-width: 768px) {
  .nav-links { display: none; }
  .hero-headline { font-size: 48px; }
  .grid-2col { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .hero-headline { font-size: 36px; }
  .section { padding: 60px 20px; }
}
```

### Touch targets
- All buttons ≥ 44px height
- No interactive element within 8px of screen edge

### iOS reliability
- All inputs `font-size: 16px` (prevents iOS zoom)
- Bottom elements add `padding-bottom: env(safe-area-inset-bottom, 0px)`

### Checklist (run before every commit with UI changes)
- [ ] Navbar hides center links on mobile, shows only logo + CTA
- [ ] All grids collapse to 1 column on mobile
- [ ] Font sizes readable on 390px
- [ ] Touch targets ≥ 44px
- [ ] WhatsApp FAB visible and accessible on mobile
- [ ] Contact form usable on mobile keyboard

---

## 10. NEXT.JS SPECIFICS

### Version: Next.js 16 App Router

### Dynamic route params are Promises
```typescript
// CORRECT — always await params
export default async function Page({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
}
```

### Long-running routes
```typescript
// Add to any route calling external APIs or doing heavy work
export const maxDuration = 60
```

### Server vs client components
- Default: server component (no `'use client'`)
- Use `'use client'` only for interactivity (forms, state, Three.js, Supabase auth)
- Never use `dynamic()` with `ssr: false` in server components

### Middleware file
- Named `proxy.ts` not `middleware.ts`
- Exports `proxy` function not `middleware` function
- Matcher config still uses `export const config` (this is allowed in proxy.ts)

### Pages Router patterns that DO NOT work in App Router
- `export const config = {}` in page files — DO NOT USE
- `getServerSideProps` — DO NOT USE
- `getStaticProps` — DO NOT USE

---

## 11. TESTING DISCIPLINE + TDD

### Test stack
```
Vitest — unit and integration tests
Playwright — E2E browser tests (future)
```

### TDD sequence (mandatory for every API route)
```
Write test → Watch it fail → Write route → Watch it pass → Refactor
```

Never write a route without writing its test first (or immediately after).

### Unit test template
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')
vi.stubEnv('RESEND_API_KEY', 'test-resend-key')
vi.stubEnv('ADMIN_EMAIL', 'admin@bisxp.com')

const mockInsert = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      insert: mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: '123' }, error: null })
        })
      })
    })
  })
}))

describe('POST /api/enquiry', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 400 when name missing', async () => {
    const req = new Request('http://localhost/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', message: 'Hello this is a test message' })
    })
    const { POST } = await import('@/app/api/enquiry/route')
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 with valid data', async () => {
    const req = new Request('http://localhost/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@test.com',
        message: 'This is a test message with enough characters'
      })
    })
    const { POST } = await import('@/app/api/enquiry/route')
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
```

### Integration test requirement
For every API route that writes to the database:
```typescript
// tests/integration/enquiry.test.ts
// Run with: RUN_INTEGRATION=true npm run test:integration
it('POST /api/enquiry saves to database', async () => {
  const res = await fetch('http://localhost:3000/api/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', email: 'test@test.com', message: 'Test message with enough chars' })
  })
  expect(res.status).toBe(200)
  // Verify in DB
  const { data } = await serviceClient.from('enquiries').select('*').eq('email', 'test@test.com').single()
  expect(data).toBeTruthy()
  // Cleanup
  await serviceClient.from('enquiries').delete().eq('email', 'test@test.com')
})
```

### Test health targets
| Metric | Target |
|--------|--------|
| Unit test count | Growing every session |
| Test pass rate | 100% always |
| TypeScript errors | 0 always |
| Files over 500 lines | 0 always |

---

## 12. BUILD SESSION STRATEGY

### How Shah and Claude.ai work together
1. **Shah identifies the need** — "I want X feature"
2. **Claude.ai designs** — writes FEATURE.md with schema, API contracts, test plan
3. **Shah approves** — reviews and confirms FEATURE.md
4. **Claude.ai writes the instruction** — single fenced code block for Claude Code
5. **Claude Code builds** — follows the instruction exactly
6. **Claude.ai reviews** — checks output against FEATURE.md acceptance criteria

### Instruction format
All Claude Code instructions in **fenced code blocks with triple backticks and no language tag**.
Never HTML widgets, never artifacts for Claude Code instructions — the copy button breaks
in long conversations.

### Parallel session rules
- Always `git pull origin develop` at session start
- Check `CLAUDE_CONTEXT.md` for in-progress work before starting
- Never build something already listed as built
- Commit frequently with descriptive messages

### Session scope discipline
One session = one feature or one refactor. Never attempt multiple unrelated
features in one session. Scope creep causes partial implementations and
broken intermediate states.

---

## 13. ENVIRONMENT SETUP

### Required environment variables
```
NEXT_PUBLIC_SUPABASE_URL=https://ghcxevhmhtuvjzmptvfw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase Settings → API>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase Settings → API — keep secret>
RESEND_API_KEY=<from BISXP Resend account>
RESEND_FROM_EMAIL=hello@bisxp.com
ADMIN_EMAIL=<your email for enquiry notifications>
NEXT_PUBLIC_WHATSAPP_NUMBER=<full number with country code>
```

### Supabase project
- Project: `bisxp6-cmd` org
- URL: `https://ghcxevhmhtuvjzmptvfw.supabase.co`
- Region: US East
- Separated from CareGrid: 2026-04-07
- Admin user: `bisxp6@google.com` (created manually, no trigger)
- Tables: enquiries, profiles

### Supabase OAuth redirect URLs
Configure in Supabase → Authentication → URL Configuration → Redirect URLs:
```
https://bisxp-com.vercel.app/**
https://bisxp.com/**
https://*-bisxp6-cmd.vercel.app/**
http://localhost:3000/**
```

Without the preview wildcard, OAuth on preview URLs redirects to production —
making preview validation impossible. Configure on day one, never wait.

### Vercel project
- Project: `bisxp-com`
- Production URL: `bisxp-com.vercel.app`
- Domain: `bisxp.com` (pending DNS connection via GoDaddy)
- Auto-deploy: push to `main` → production deploy
- Branch deploys: push to `develop` → preview URL

### Environment variable locations
- Local: `.env.local` (never committed, in `.gitignore`)
- Production: Vercel dashboard → Project Settings → Environment Variables
- Template: `.env.example` (committed, placeholder values only)

---

## 14. COMMON MISTAKES

Learned from TABRO.IN — do not repeat these on BISXP.com:

1. **`getSession()` instead of `getUser()`** — reads local storage, can be spoofed. Always `getUser()`.

2. **`createAuthClient()` outside `useMemo()`** — creates duplicate GoTrueClient instances every re-render. Always wrap in `useMemo()`.

3. **Service role key in client component** — full database access with no RLS. Server-side API routes only.

4. **`middleware.ts` instead of `proxy.ts`** — Next.js 16 expects `proxy.ts` with `proxy` export function.

5. **Forgetting `await params`** — Next.js 16 dynamic route params are Promises. Always destructure after await.

6. **Missing `maxDuration = 60`** — API routes calling Resend or Supabase can exceed default 10s timeout on Vercel.

7. **Email failure killing the request** — always wrap Resend calls in try/catch. Enquiry saves to DB regardless.

8. **Installing Three.js via npm** — causes SSR failures. CDN in useEffect only, with `dynamic({ ssr: false })`.

9. **Direct Supabase calls in page.tsx** — violates DIP. Business logic in `lib/`, pages call API routes or lib functions.

10. **Hardcoded hex colors** — always use CSS variables. `#D4A843` in component code = instant code review rejection.

11. **`export const config = {}` in page files** — Pages Router pattern, silently ignored in App Router.

12. **Not saving migrations** — every SQL run in Supabase dashboard must be saved to `supabase/migrations/NNN_name.sql` immediately.

13. **Fan-out JOINs in views** — use correlated subqueries for all aggregations across 1-to-many relationships.

14. **Pushing to main directly** — all work goes to `develop` branch first, then PR to `main`.

---

## 15. SEO PATTERNS

### Metadata pattern (every page)
```typescript
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BISXP — Blueprint. Ignite. Scale. Xperience.',
  description: 'AI-native consultancy that builds marketplaces and SaaS products. From blueprint to scale.',
  openGraph: {
    title: 'BISXP — Blueprint. Ignite. Scale. Xperience.',
    description: 'AI-native consultancy that builds marketplaces and SaaS products.',
    url: 'https://bisxp.com',
    siteName: 'BISXP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  }
}
```

### SEO checklist for new pages
- [ ] Unique `<title>` tag via Metadata export
- [ ] Meta description (150–160 chars)
- [ ] Open Graph tags (title, description, image)
- [ ] Single H1, nested H2/H3
- [ ] Images have alt text
- [ ] Page loads < 3 seconds on mobile

### Future SEO work
- OG image at `/api/og` (1200×630 branded)
- `sitemap.xml` — static for now, dynamic when blog is added
- `robots.txt`
- JSON-LD Organisation schema on homepage

---

## 16. SCALE THRESHOLDS

BISXP.com is a brochure site + admin dashboard. Scale concerns are minimal
compared to TABRO and TheUnitedSports, but document them for completeness.

| Metric | Current | Action needed |
|--------|---------|---------------|
| Enquiries in DB | 0 | — |
| Monthly enquiries | 0 | Pagination at 500+ |
| Email volume | 0 | Upgrade Resend plan at 3000/mo |
| Admin users | 1 | Add multi-admin support at 2+ |
| Page count | 4 | Add blog/case studies when ready |

### When to add a blog
- When BISXP has 3+ completed client case studies
- When there's a content strategy to publish monthly
- Not before — empty blogs damage credibility

---

## 17. DISTINGUISHED ENGINEER MINDSET

Learned from building TABRO.IN and TheUnitedSports. Apply to BISXP.

**Don't solve today's scale problem for tomorrow's scale.**
BISXP.com has one admin user, a contact form, and a brochure. Don't
add Redis caching, rate limiting, or multi-region failover yet. Build
for the scale you have. Document the threshold at which to upgrade.

**Boring technology is usually right.**
The BISXP stack (Next.js, Supabase, Resend, Vercel) is proven, documented,
and well-understood. Only add new technologies when the existing ones
genuinely cannot solve the problem.

**A working simple thing beats a sophisticated broken thing.**
The 3D hero is impressive but it must not break the contact form.
The contact form is why the site exists.

**Make the invisible visible.**
A consultant's credibility lives in their portfolio and process.
Every improvement to BISXP.com is a demonstration of the product BISXP sells.
Ship regularly and visibly.

**The site IS the pitch.**
Every visitor who bounces without contacting us is a lost client.
Conversion (Contact → Enquiry) is the only metric that matters.
Optimise for that above everything else.

---

## 18. GLOSSARY

| Term | Definition |
|------|-----------|
| **BISXP** | Blueprint. Ignite. Scale. Xperience. — the consultancy brand |
| **Platform Bible** | This file — the engineering manual |
| **Enquiry** | Contact form submission from a prospective client |
| **Admin** | The single user who can log into `/admin` |
| **Proxy.ts** | The middleware file (named proxy.ts in Next.js 16 convention) |
| **Service role** | Supabase client with full RLS bypass — server-side only |
| **RLS** | Row Level Security — Supabase/PostgreSQL access control |
| **Fan-out** | Query row multiplication from many-to-many JOINs |
| **Thin route** | API route with < 80 lines, business logic in lib/ |
| **Session** | A Claude Code build session (numbered sequentially) |
| **FEATURE.md** | Feature design document required before any new feature work |
| **Develop branch** | Integration branch — all work goes here before PR to main |
| **Three.js CDN** | Three.js loaded via cdnjs, never npm installed |
| **Cormorant Garamond** | Heading font — editorial, premium |
| **Outfit** | Body font — clean, readable |
| **TABRO.IN** | BISXP portfolio product 1 — India venue marketplace |
| **TheUnitedSports** | BISXP portfolio product 2 — US/Canada sports marketplace |

---

## 19. CLAUDE.AI + CLAUDE CODE FEEDBACK LOOP

### Observation template (add to SESSION_OBSERVATIONS.md each session)

```markdown
## Session [N] — [Date]

### Files created/modified
- [list files with full paths]

### Test health
- Tests passing: [X/Y]
- New tests added: [N]
- Tests removed: [N] (with reason)

### Patterns documented
- [pattern name]: [brief description]

### Gaps identified
- [gap]: [impact] — [suggested fix]

### Degradation signals
- [ ] File size creep (any file > 500 lines?)
- [ ] Test count decreased?
- [ ] New duplicate code introduced?
- [ ] CSS hardcoded hex values?
- [ ] Console.log left in production code?
- [ ] Missing loading states?
- [ ] Mobile not tested?

### Suggestions for next session
- [suggestion 1]
- [suggestion 2]
```

### Decision framework
When choosing between approaches:

| Factor | Weight | Score 1–5 |
|--------|--------|-----------|
| Simplicity | 3x | How simple is it? |
| Mobile-first | 2x | Does it work on 390px? |
| Conversion impact | 2x | Does it help a visitor become an enquiry? |
| Testability | 1x | Can it be unit tested? |
| Consistency | 1x | Does it match existing patterns? |

Score = sum of (weight × score). Pick the highest total.

### Degradation thresholds

| Signal | Yellow | Red |
|--------|--------|-----|
| Largest file | > 400 lines | > 600 lines |
| Test count vs last session | Decreased by 1–3 | Decreased by > 3 |
| TypeScript errors | Any warnings | Any errors |
| Duplicate code blocks | 2 copies | 3+ copies |

---

_This is the BISXP.com Platform Bible._
_Updated by Claude Code at each documentation session._
_For session-specific state, see `CLAUDE_CONTEXT.md`._
_For project rules, see `.claude/CLAUDE.md`._
