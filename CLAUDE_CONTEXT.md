# BISXP.COM — Session Brain

**Last Updated:** Session 5 (platform redesign) — 2026-04-08

---

## Project
BISXP consultancy website for bisxp.com.
AI-native technology consultancy that builds marketplaces and SaaS products.

Repo: tafzal2025-cloud/bisxp-com
Local: C:\Users\taher\bisxp-com
Deploy: Vercel (not yet configured)

---

## Stack
| Layer | Tech |
|---|---|
| Framework | Next.js 16, App Router, TypeScript strict |
| Database | Supabase (Postgres + Auth + Realtime) |
| Email | Resend |
| Deploy | Vercel |
| Styling | Inline CSS vars — NO Tailwind, NO component libs |
| 3D | Three.js via CDN (NOT npm) |

---

## Environment Variables
| Key | Status | Where to get |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | ⚠️ FILL IN | Supabase → Settings → API |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ⚠️ FILL IN | Supabase → Settings → API |
| SUPABASE_SERVICE_ROLE_KEY | ⚠️ FILL IN | Supabase → Settings → API (keep secret) |
| RESEND_API_KEY | ⚠️ FILL IN | resend.com → API Keys |
| RESEND_FROM_EMAIL | ⚠️ Set to hello@bisxp.com | Must be verified in Resend |
| ADMIN_EMAIL | ⚠️ FILL IN | Your email for enquiry notifications |
| NEXT_PUBLIC_WHATSAPP_NUMBER | ⚠️ FILL IN | Full number e.g. 917675822722 |
| ANTHROPIC_API_KEY | ⚠️ FILL IN | anthropic.com → API Keys (server-side only) |

---

## Database
Supabase URL: ghcxevhmhtuvjzmptvfw.supabase.co
Region: US East
Note: Separated from CareGrid on 2026-04-07.
CareGrid retains vcyiudixtnmycntywmxa.supabase.co.
BISXP.com has its own standalone project.

**Tables:**
- `enquiries` — contact form submissions. Status: new → contacted → qualified → converted → closed
- `profiles` — admin users (auto-created via trigger when auth user is created)
- `bisxp_settings` — key/value store for editable homepage content (30+ keys across hero, stats, services, process, contact, visibility)
- `bisxp_case_studies` — dynamic case study cards (CRUD from admin)
- `bisxp_research_cards` — dynamic research/security cards (CRUD from admin)
- `bisxp_team_members` — dynamic team member profiles (CRUD from admin)
- `bisxp_services` — dynamic service cards (CRUD from admin)

**Run this SQL in Supabase Dashboard → SQL Editor:**
See `supabase/migrations/001_initial_schema.sql`

**Create admin user:**
Supabase Dashboard → Authentication → Users → Invite user
Enter Shah's email. They'll get a magic link to set password.

---

## Files Created — Session 1

```
app/
  layout.tsx                    ✅ Root layout, CSS vars, Google Fonts, metadata
  page.tsx                      ✅ Full single-page website (all 10 sections)
  components/
    HeroCanvas.tsx              ✅ Three.js canvas (CDN, SSR-disabled via dynamic import)
  admin/
    page.tsx                    ✅ Enquiry dashboard with real-time updates
  auth/
    login/page.tsx              ✅ Email/password login
    callback/route.ts           ✅ OAuth callback handler
  api/
    enquiry/route.ts            ✅ POST — save enquiry + send email via Resend
    enquiry/[id]/route.ts       ✅ PATCH — update enquiry status (auth-protected)
    ai/route.ts                 ✅ POST — AI proxy for demo suite (keeps API key server-side)
    settings/route.ts           ✅ GET — public settings (key/value map)
    admin/settings/route.ts     ✅ GET + POST — auth-protected settings editor
    cms/case-studies/route.ts   ✅ GET — public case studies
    cms/research-cards/route.ts ✅ GET — public research cards
    cms/team-members/route.ts   ✅ GET — public team members
    cms/services/route.ts       ✅ GET — public services
    admin/cms/*/route.ts        ✅ GET + POST — admin CRUD for all 4 CMS tables
    admin/cms/*/[id]/route.ts   ✅ PATCH + DELETE — admin update/delete for all 4 CMS tables
  method/
    page.tsx                    ✅ /method — server component with metadata
    MethodPageClient.tsx        ✅ /method — 3-day intensive page with apply form
lib/
  supabase.ts                   ✅ Browser client + helpers
  settings.ts                   ✅ getSettings() — server-side settings fetch
  cms.ts                        ✅ getCaseStudies, getResearchCards, getTeamMembers, getServices
  admin-auth.ts                 ✅ getAuthUser() — shared admin auth helper
app/
  sitemap.ts                    ✅ /sitemap.xml — homepage + /method
  robots.ts                     ✅ /robots.txt — allow all, disallow /admin /api
  api/og/route.tsx              ✅ /api/og — Edge OG image with BISXP branding
  method/layout.tsx             ✅ Method page SEO metadata + OG image
vitest.config.ts                ✅ Vitest configuration
tests/
  unit/
    enquiry-api.test.ts         ✅ 5 unit tests for POST /api/enquiry
    enquiry-id-api.test.ts      ✅ 3 unit tests for PATCH /api/enquiry/[id]
  integration/
    enquiry.test.ts             ✅ DB write verification (skips without env vars)
.github/
  workflows/ci.yml              ✅ CI pipeline — TypeScript + tests + build
  pull_request_template.md      ✅ PR template with SOLID audit
proxy.ts                        ✅ Middleware — protects /admin
.env.local                      ✅ Template (fill values before running)
.env.example                    ✅ Committed placeholder values
supabase/
  migrations/001_initial_schema.sql  ✅ Full DB schema
  migrations/002_bisxp_settings.sql ✅ Settings table + seed
  migrations/003_bisxp_cms.sql      ✅ 4 CMS tables + seed
  migrations/004_form_messages.sql  ✅ Form success messages
  migrations/005_platform_redesign.sql  ✅ Platform section settings
  migrations/005b_platform_settings_update.sql ✅ Copy updates
.claude/
  CLAUDE.md                     ✅ Standing instructions
CLAUDE_CONTEXT.md               ✅ This file
  # demos/ route removed in Session 2 — static demos accessed via /demos/access.html
public/
  demos/
    index.html                  ✅ 8-domain AI demo index (static, noindex)
    financial.html              ✅ Financial Services — 5 demos
    healthcare.html             ✅ Healthcare — 5 demos
    insurance.html              ✅ Insurance — 5 demos
    government.html             ✅ Government — 5 demos
    hr.html                     ✅ HR & Workforce — 5 demos
    legal.html                  ✅ Legal & Compliance — 5 demos
    supply-chain.html           ✅ Supply Chain — 5 demos
    customer-service.html       ✅ Customer Service — 5 demos
    workflows.html              ✅ 8 end-to-end workflow demos, 70+ steps, anchor nav #wf0-#wf7
```

---

## Sections Built (app/page.tsx)
1. ✅ Fixed navbar (Case Studies + Services + Process + Contact)
2. ✅ Hero (Three.js gold octahedron, particles, parallax, CTAs)
3. ✅ Stats bar (4 marketplaces, 25 yrs, 3 countries, 100% hands-on)
4. ✅ BISXP acronym (Blueprint / Implement / Scale / Xperience)
5. ✅ Case Studies — TABRO.IN, TheUnitedSports, CareGrid, MediGrid
6. ✅ Research & Security — ZeroMesh + BISXP Security
7. ✅ BISXP Method block — 3-day intensive promo
8. ✅ Services — 4 cards (no pricing)
9. ✅ Process — 4-step horizontal flow
10. ✅ Who we work with — CSS marquee
11. ✅ Enquiry form — full validation, Supabase save, Resend email
12. ✅ Team — Tharif Afzal + Amtul Baseer Ifra
13. ✅ Footer + WhatsApp FAB

## Pages
- `/` — Homepage (13 sections)
- `/method` — BISXP Method 3-day intensive (7 sections + apply form)
- `/admin` — Enquiry dashboard (auth-protected)
- `/auth/login` — Admin login
- `/demos/access.html` — Password gate for demo suite (BISXP2026)

---

## Session 1 To-Dos Completed
- [x] Next.js project init
- [x] Supabase + Resend dependencies
- [x] All files created
- [x] Git committed

---

## Pending — Session 3+
- [ ] Split app/page.tsx into section components (1828 lines — over 500-line limit)
- [ ] Verify hello@bisxp.com domain in Resend (Shah action)
- [ ] Connect bisxp.com domain in Vercel (Shah action)
- [ ] SEO: add OG image (1200×630 branded)
- [ ] Add Google Analytics or Plausible
- [ ] Add sitemap.xml and robots.txt
- [ ] Add JSON-LD structured data
- [ ] E2E Playwright tests

---

## Notes
- Three.js loaded via CDN (r128) — NOT npm installed. HeroCanvas uses dynamic() with ssr:false.
- proxy.ts is the middleware file (NOT middleware.ts) — this is the BISXP/TABRO convention.
- Admin users created via Supabase Dashboard only — no public signup.
- Enquiry email uses Resend. If email fails, enquiry is still saved to DB (graceful degradation).
- AI proxy: /api/ai proxies Claude requests for demo suite. Requires ANTHROPIC_API_KEY env var in Vercel.
