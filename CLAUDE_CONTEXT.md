# BISXP.COM — Session Brain

**Last Updated:** Session 1 — 2026-03-16

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

---

## Database
Supabase URL: (fill in from env)

**Tables:**
- `enquiries` — contact form submissions. Status: new → contacted → qualified → converted → closed
- `profiles` — admin users (auto-created via trigger when auth user is created)

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
lib/
  supabase.ts                   ✅ Browser client + helpers
proxy.ts                        ✅ Middleware — protects /admin
.env.local                      ✅ Template (fill values before running)
.env.example                    ✅ Committed placeholder values
supabase/
  migrations/001_initial_schema.sql  ✅ Full DB schema
.claude/
  CLAUDE.md                     ✅ Standing instructions
CLAUDE_CONTEXT.md               ✅ This file
```

---

## Sections Built (app/page.tsx)
1. ✅ Fixed navbar (logo + nav links + CTA, mobile hamburger)
2. ✅ Hero (Three.js gold octahedron, particles, parallax, CTAs)
3. ✅ Stats bar (2 marketplaces, 8 wks, 3 countries, 100% hands-on)
4. ✅ BISXP acronym (Blueprint / Ignite / Scale / Xperience)
5. ✅ Portfolio — TABRO.IN + TheUnitedSports.com
6. ✅ Services — 4 tiers with pricing
7. ✅ Process — 4-step horizontal flow
8. ✅ Who we work with — CSS marquee
9. ✅ Enquiry form — full validation, Supabase save, Resend email
10. ✅ Footer + WhatsApp FAB

---

## Session 1 To-Dos Completed
- [x] Next.js project init
- [x] Supabase + Resend dependencies
- [x] All files created
- [x] Git committed

---

## Pending — Session 2+
- [ ] Fill .env.local with real Supabase + Resend values
- [ ] Run 001_initial_schema.sql in Supabase SQL Editor
- [ ] Create admin user in Supabase Dashboard → Authentication
- [ ] Verify hello@bisxp.com domain in Resend
- [ ] Push to GitHub (tafzal2025-cloud/bisxp-com) — Shah does this
- [ ] Configure Vercel deploy with env vars
- [ ] Test enquiry form end-to-end
- [ ] Test admin login + status cycling
- [ ] SEO: add OG image (1200×630 branded)
- [ ] Add Google Analytics or Plausible
- [ ] Consider blog/articles section in Session 2

---

## Notes
- Three.js loaded via CDN (r128) — NOT npm installed. HeroCanvas uses dynamic() with ssr:false.
- proxy.ts is the middleware file (NOT middleware.ts) — this is the BISXP/TABRO convention.
- Admin users created via Supabase Dashboard only — no public signup.
- Enquiry email uses Resend. If email fails, enquiry is still saved to DB (graceful degradation).
