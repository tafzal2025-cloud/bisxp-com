# Feature: Session 2 — Engineering Foundation + Case Studies + BISXP Method
_Status: Approved_
_Date: 2026-04-07_
_Save to: docs/features/FEATURE-S2-foundation.md_

---

## Problem Statement

**What problem does this solve?**
BISXP.com was built in Session 1 as a fast brochure site with zero tests,
no CI pipeline, no develop branch, and theatrical demos that undermine the
credibility the homepage is trying to build. Three critical debt items exist.
The demos section needs replacing with honest case studies. The BISXP Method
learning programme needs a homepage block and a dedicated page.

**Who benefits?**
Shah — engineering confidence, no more shipping blind.
Potential clients — see real work, not simulations.
Programme applicants — dedicated /method page to apply from.

**How do we know it's solved?**
- npm test passes with 8+ tests
- CI pipeline runs on every push to develop
- develop branch exists and pushed to origin
- No demos link in navbar
- Case Studies section live on homepage
- /method page accessible at bisxp-com.vercel.app/method
- Apply form on /method submits to /api/enquiry
- All critical debt items marked cleared in TECHNICAL_DEBT.md

---

## Out of Scope

- [ ] E2E Playwright tests — Session 3+
- [ ] Resend domain verification — Shah action, not Claude Code
- [ ] bisxp.com domain connection — Shah action, not Claude Code
- [ ] Demos content improvement — removed, not improved
- [ ] Blog section — Session 4+
- [ ] Google Analytics / Plausible — Session 3+

---

## Schema Changes

No DB changes. Existing enquiries table handles /method apply form
submissions via business_type = "BISXP Method". No migration needed.

**Integration test DB write:**
POST /api/enquiry → creates row in enquiries table
Test cleans up after itself (deletes test row).
Requires SUPABASE_TEST_URL and SUPABASE_TEST_SERVICE_ROLE_KEY env vars.
Test skips gracefully if env vars not set.

---

## API Contracts

No new API routes. Existing routes being tested:

### POST /api/enquiry
**Auth:** Public
**Tests:**
- 400 when name missing
- 400 when email invalid
- 400 when message too short
- 200 with valid data
- 200 when email fails (graceful degradation — enquiry still saves)

### PATCH /api/enquiry/[id]
**Auth:** Required (Supabase session)
**Tests:**
- 401 without auth
- 200 with valid status update
- 400 with invalid status value

---

## SOLID Audit

| Principle | How This Session Complies |
|-----------|--------------------------|
| **S** — Single Responsibility | Each test file tests one route. /method page renders one page. CI workflow does one job. |
| **O** — Open/Closed | CI workflow is a new file — extends build system without touching existing routes |
| **L** — Liskov Substitution | N/A — no shared components in this session |
| **I** — Interface Segregation | Test files import only what they test. No god-object props. |
| **D** — Dependency Inversion | /method apply form calls existing /api/enquiry — no new business logic, no direct DB calls in page |

---

## File Impact Table

| File | Action | Lines (est.) | Purpose |
|------|--------|-------------|---------|
| `vitest.config.ts` | Create | ~15 | Vitest configuration |
| `tests/unit/enquiry-api.test.ts` | Create | ~80 | POST /api/enquiry — 5 unit tests |
| `tests/unit/enquiry-id-api.test.ts` | Create | ~50 | PATCH /api/enquiry/[id] — 3 unit tests |
| `tests/integration/enquiry.test.ts` | Create | ~40 | DB write verification |
| `.github/workflows/ci.yml` | Create | ~45 | CI pipeline — TypeScript + tests + build |
| `.github/pull_request_template.md` | Create | ~30 | PR template with SOLID audit |
| `app/page.tsx` | Modify | +200 | Case Studies section + BISXP Method block |
| `app/method/page.tsx` | Create | ~450 | Full /method page — 7 sections |
| `app/demos/page.tsx` | Delete | -20 | Remove demos Next.js route |
| `app/demos/layout.tsx` | Delete (if exists) | -10 | Remove demos layout |
| `public/demos/access.html` | Create | ~80 | Password gate — BISXP2026 |
| `public/demos/bisxp-demo-index.html` | Modify | +5 | Auth check script + copy fixes |
| `public/demos/bisxp-mastercard-demo.html` | Modify | +5 | Auth check script + copy fixes |
| `public/demos/bisxp-healthcare-demo.html` | Modify | +5 | Auth check script + copy fixes |
| `public/demos/bisxp-customer-service-demo.html` | Modify | +5 | Auth check script + copy fixes |
| `public/demos/bisxp-government-demo.html` | Modify | +3 | Auth check script |
| `public/demos/bisxp-insurance-demo.html` | Modify | +3 | Auth check script |
| `public/demos/bisxp-hr-demo.html` | Modify | +3 | Auth check script |
| `public/demos/bisxp-legal-demo.html` | Modify | +3 | Auth check script |
| `public/demos/bisxp-supply-chain-demo.html` | Modify | +3 | Auth check script |
| `public/demos/workflows.html` | Modify | +3 | Auth check script |
| `public/demos/merchant-lifecycle.html` | Modify | +3 | Auth check script |
| `docs/features/FEATURE-S2-foundation.md` | Create | ~200 | This file |
| `CLAUDE_CONTEXT.md` | Modify | +40 | Session 2 documentation |
| `SESSION_OBSERVATIONS.md` | Modify | +30 | Session 2 observation block |
| `TECHNICAL_DEBT.md` | Modify | +15 | Mark 4 items cleared |

**Total estimated new lines:** ~1,100
**Files over 500 lines:** app/method/page.tsx may approach 450–500 — monitor

---

## Test Plan

### Unit Tests (required — written alongside code, not at end)

| Test | Route | What it verifies |
|------|-------|-----------------|
| returns 400 when name missing | POST /api/enquiry | Name validation |
| returns 400 when email invalid | POST /api/enquiry | Email validation |
| returns 400 when message too short | POST /api/enquiry | Message min-length |
| returns 200 with valid data | POST /api/enquiry | Happy path |
| returns 200 when email send fails | POST /api/enquiry | Graceful degradation |
| returns 401 without auth | PATCH /api/enquiry/[id] | Auth guard |
| returns 200 with valid status update | PATCH /api/enquiry/[id] | Happy path |
| returns 400 with invalid status value | PATCH /api/enquiry/[id] | Status validation |

---

## Integration Test Requirements

| Route | Operation | Integration test |
|-------|-----------|-----------------|
| POST /api/enquiry | Creates enquiry row in DB | submit valid data → query DB → expect row exists → delete row |

Test skips if SUPABASE_TEST_URL not set:
```typescript
if (!process.env.SUPABASE_TEST_URL) {
  test.skip('integration: SUPABASE_TEST_URL not set')
}
```

---

## Acceptance Criteria

- [ ] npm test passes — 8+ tests, 0 failures
- [ ] npx tsc --noEmit clean
- [ ] CI pipeline defined in .github/workflows/ci.yml
- [ ] develop branch exists and pushed to origin
- [ ] No file exceeds 500 lines
- [ ] No hardcoded hex colors in new files
- [ ] No console.log in production code
- [ ] No demos link in navbar
- [ ] Case Studies section renders on homepage with 4 marketplace cards
- [ ] BISXP Method block renders on homepage with 4 stats
- [ ] /method page loads at /method
- [ ] Apply form on /method page submits successfully
- [ ] public/demos/access.html exists and password gate works
- [ ] All demo HTML files redirect to access.html when not authenticated
- [ ] CLAUDE_CONTEXT.md updated with all Session 2 changes
- [ ] SESSION_OBSERVATIONS.md updated with Session 2 block
- [ ] TECHNICAL_DEBT.md updated — items 1.1, 1.2, 1.3, 1.4 marked cleared

---

## Claude Code Instructions

Read CLAUDE_CONTEXT.md, BISXP-CLAUDE.md, TECHNICAL_DEBT.md,
and SESSION_OBSERVATIONS.md before starting. Read skill files
at .claude/skills/supabase/SKILL.md and
.claude/skills/api-routes/SKILL.md before writing any code.

Produce SESSION START REPORT before writing any code:
```
═══ SESSION START REPORT ═══
Session: 2 — 2026-04-07
Branch: [current branch]
Tests passing: [run npm test, report count]
TypeScript: [run npx tsc --noEmit, report clean or errors]
Files over 500 lines: [list any, or "None"]
Last session summary: [1-line from SESSION_OBSERVATIONS.md]
Debt items: [count from TECHNICAL_DEBT.md Priority 1]
Task for this session: Engineering foundation + case studies + /method page
═══════════════════════════
```

---

STEP 1 — Create develop branch
```bash
git checkout -b develop
git push origin develop
```
Confirm branch exists before continuing.

---

STEP 2 — Install Vitest and configure

Install:
```bash
npm install --save-dev vitest @vitejs/plugin-react
```

Create vitest.config.ts:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: [],
    exclude: [
      '**/node_modules/**',
      '**/tests/integration/**'
    ]
  },
  resolve: {
    alias: { '@': new URL('./', import.meta.url).pathname }
  }
})
```

Add to package.json scripts:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:integration": "vitest run tests/integration"
```

Run npm test — should show 0 tests, 0 failures (no tests yet).

---

STEP 3 — Write unit tests for POST /api/enquiry

Read app/api/enquiry/route.ts in full first.
Read .claude/skills/api-routes/SKILL.md for the TDD template.

Create tests/unit/enquiry-api.test.ts with these 5 tests:
1. returns 400 when name missing
2. returns 400 when email invalid (not a valid email format)
3. returns 400 when message too short (under 20 characters)
4. returns 200 with valid name + email + message
5. returns 200 even when Resend throws (email failure doesn't fail request)

Mock @supabase/supabase-js and resend.
Mock environment variables with vi.stubEnv.

Run npm test after — must show 5 passing before continuing.

---

STEP 4 — Write unit tests for PATCH /api/enquiry/[id]

Read app/api/enquiry/[id]/route.ts in full first.

Create tests/unit/enquiry-id-api.test.ts with these 3 tests:
1. returns 401 when no Authorization header
2. returns 200 with valid status update (status: 'contacted')
3. returns 400 when status value is not in allowed list

Mock @supabase/ssr for auth verification.
Mock @supabase/supabase-js for DB update.

Run npm test after — must show 8 passing before continuing.

---

STEP 5 — Write integration test

Create tests/integration/enquiry.test.ts:

```typescript
import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const SKIP = !process.env.SUPABASE_TEST_URL

describe('POST /api/enquiry — integration', () => {
  it.skipIf(SKIP)('saves enquiry to database', async () => {
    const testEmail = `test-${Date.now()}@bisxp-integration-test.com`

    const res = await fetch('http://localhost:3000/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Integration Test User',
        email: testEmail,
        message: 'This is an integration test message with enough characters'
      })
    })

    expect(res.status).toBe(200)

    // Verify in DB
    const db = createClient(
      process.env.SUPABASE_TEST_URL!,
      process.env.SUPABASE_TEST_SERVICE_ROLE_KEY!
    )
    const { data } = await db
      .from('enquiries')
      .select('*')
      .eq('email', testEmail)
      .single()

    expect(data).toBeTruthy()
    expect(data.name).toBe('Integration Test User')

    // Cleanup
    await db.from('enquiries').delete().eq('email', testEmail)
  })
})
```

Do NOT run this test — it requires SUPABASE_TEST_URL env var
and a running dev server. Log it as skipped in the observation block.

---

STEP 6 — Set up GitHub Actions CI

Create .github/workflows/ci.yml:

```yaml
name: CI

on:
  push:
    branches: [develop, master]
  pull_request:
    branches: [master]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: TypeScript check
        run: npx tsc --noEmit

      - name: Unit tests
        run: npm test
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Build check
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          RESEND_FROM_EMAIL: ${{ secrets.RESEND_FROM_EMAIL }}
          ADMIN_EMAIL: ${{ secrets.ADMIN_EMAIL }}
          NEXT_PUBLIC_WHATSAPP_NUMBER: ${{ secrets.NEXT_PUBLIC_WHATSAPP_NUMBER }}
```

Create .github/pull_request_template.md:

```markdown
## What this PR does
[Description of changes]

## SOLID Checkpoint
- [ ] S — Every new file does exactly one thing
- [ ] O — Extended existing system without modifying working code
- [ ] L — Shared components work identically for all consumers
- [ ] I — No component receives props it does not use
- [ ] D — Business logic in lib/, not in routes or pages

## Test delta
Tests before: [N]
Tests after: [N]
Delta: [+/-N]

## Files over 500 lines
[List any, or "None"]

## Checklist
- [ ] npx tsc --noEmit clean
- [ ] npm test passing
- [ ] No hardcoded hex colors
- [ ] Mobile tested at 390px
- [ ] CLAUDE_CONTEXT.md updated
- [ ] SESSION_OBSERVATIONS.md updated
- [ ] TECHNICAL_DEBT.md updated if debt added or resolved
```

---

STEP 7 — Homepage content changes

Read app/page.tsx in full before making any changes.

Apply these changes in order:

7a — Remove demos nav link, add Case Studies link:
Find the navbar links. Remove any link pointing to /demos.
Add: <a href="#case-studies" className="nav-link">Case Studies</a>

7b — Add Case Studies section (cs-section):
Add the full Case Studies section JSX and CSS as specified
in the Claude.ai instruction from this session
(4 marketplace cards: TABRO.IN, TheUnitedSports,
CareGrid, MediGrid — each with market, title, problem quote,
what we built, AI layer, scale architecture, status).
Insert AFTER the Research & Security section (rs-section)
and BEFORE the Services section (id="services").

7c — Add BISXP Method block (method-section):
Add the full Method block JSX and CSS as specified
(2-column layout: left=copy+CTAs, right=4 stat cards).
Insert AFTER the Case Studies section
and BEFORE the Services section.

Run npx tsc --noEmit after 7a, 7b, 7c — must be clean.
Run npm test — must still show 8 passing.

---

STEP 8 — Create /method page

Create app/method/page.tsx with:
- Same navbar pattern as app/page.tsx
- Same footer pattern
- Same WhatsApp FAB
- Metadata: title and description
- 7 sections: Hero, Problem, Capstone,
  Curriculum (Day 1/2/3), Deliverables,
  Who This Is For, Apply form
- Apply form posts to /api/enquiry with
  business_type: "BISXP Method" in the body
- All CSS inline, CSS variables, no Tailwind
- Mobile responsive at 900px and 480px

Run npx tsc --noEmit after — must be clean.
If file exceeds 500 lines, split into:
  app/method/page.tsx (server component, metadata)
  app/method/MethodPageClient.tsx (client component, interactive sections)

---

STEP 9 — Remove demos Next.js route

Delete app/demos/page.tsx if it exists.
Delete app/demos/layout.tsx if it exists.
Run npx tsc --noEmit — must be clean.

---

STEP 10 — Password protect demos + copy fixes

10a — Create public/demos/access.html
Password gate page with:
- BISXP logo (BISX in cream, P in amber)
- Heading: "Client Demo Access"
- Subheading: "These demos are shared with clients
  during active engagements."
- Password input + Enter button
- Password: BISXP2026
- On correct: sessionStorage.setItem('bisxp_demo_access', 'true')
  then redirect to /demos/bisxp-demo-index.html
- On incorrect: show error with hello@bisxp.com
- On load: if already authenticated, redirect immediately
- Inline CSS only, no external files

10b — Add auth check to all demo HTML files.
For each file listed below, add this script
at the very top of <body>:
<script>if(sessionStorage.getItem('bisxp_demo_access')!=='true'){window.location.replace('/demos/access.html');}</script>

Files to update:
- public/demos/bisxp-demo-index.html
- public/demos/bisxp-mastercard-demo.html
- public/demos/bisxp-healthcare-demo.html
- public/demos/bisxp-customer-service-demo.html
- public/demos/bisxp-government-demo.html
- public/demos/bisxp-insurance-demo.html
- public/demos/bisxp-hr-demo.html
- public/demos/bisxp-legal-demo.html
- public/demos/bisxp-supply-chain-demo.html
- public/demos/workflows.html
- public/demos/merchant-lifecycle.html

Do NOT add auth check to access.html itself.

10c — Copy fixes to demo index and vertical demos:

bisxp-demo-index.html:
- Hero heading: "AI-native workflows. Built for your industry."
- Stats: 3 Verticals | 11 Workflows | 72 Pipeline steps | AI + Human judgment
- Remove all "Beats:" lines from vertical cards
- Remove Insurance and Government vertical cards entirely
  (keep them in featured workflows list, remove only from cards grid)
- All CTAs: "Request a tailored demo"

bisxp-mastercard-demo.html:
- Hero: "Financial Services — AI-native workflow demos"
- Description: "Step through real financial workflows — merchant onboarding,
  dispute resolution, and compliance monitoring — with AI automation
  and human judgment at the right points."
- Footer CTA: "Request a tailored demo"

bisxp-healthcare-demo.html:
- Hero: "Healthcare — AI-native workflow demos"
- Description: "Step through real healthcare workflows — prior authorization,
  provider credentialing, HIPAA compliance, clinical trials, and adverse
  event reporting — with AI automation and human judgment at the right points."
- Footer CTA: "Request a tailored demo"

bisxp-customer-service-demo.html:
- Hero: "Customer Service — AI-native workflow demos"
- Description: "Step through real customer service workflows — incident
  resolution, churn prediction and save, and knowledge base generation —
  with AI automation and human judgment at the right points."
- Footer CTA: "Request a tailored demo"

---

STEP 11 — Update documentation

Update CLAUDE_CONTEXT.md:
- Add vitest.config.ts, test files, CI workflow to files list
- Add /method to routes table
- Update pending backlog — remove completed items
- Update _Last updated: Session 2 — 2026-04-07

Update SESSION_OBSERVATIONS.md:
Add Session 2 observation block using the template.
Include honest assessment of what was built,
test health delta (0 → 8+), any files over 500 lines,
degradation signals checklist.

Update TECHNICAL_DEBT.md:
Add "## Cleared Debt — Session 2" section:
- 1.1 No test suite — DONE (8 unit tests, Vitest configured)
- 1.2 page.tsx over 500 lines — DONE or PARTIAL (report actual line count)
- 1.3 No develop branch / CI pipeline — DONE
- 1.4 No FEATURE.md process — DONE

---

STEP 12 — Final verification

Run all checks and report results:

```bash
npm test
# Must show 8+ passing, 0 failing

npx tsc --noEmit
# Must be clean

grep -n "Beats:" public/demos/bisxp-demo-index.html
# Must return 0 results

grep -n "bisxp_demo_access" public/demos/bisxp-demo-index.html
# Must return 1 result

ls public/demos/access.html
# Must exist

ls app/method/page.tsx
# Must exist

ls app/demos/page.tsx
# Must NOT exist (deleted)
```

---

STEP 13 — Commit and push to develop

```bash
git add -A
git commit -m "feat(S2): test suite, CI pipeline, develop branch, case studies, /method page, demos password protection"
git push origin develop
```

Do NOT push to master.
Shah reviews on the develop preview URL,
then raises PR to master manually.

---

STEP 14 — Produce SESSION OBSERVATION BLOCK

Output this block in the conversation before finishing:

```
═══ SESSION OBSERVATION BLOCK ═══
Session: 2 — 2026-04-07
Duration: [approximate]
Files created: [count]
Files modified: [count]
Tests before: 0 | Tests after: [count] | Delta: +[N]
TypeScript: [clean or error count]
Files over 500 lines: [list any, or "None"]
Debt added: 0 | Debt resolved: 4
═════════════════════════════════
```
