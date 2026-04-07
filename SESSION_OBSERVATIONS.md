# Session Observations Log — BISXP.com
_Last updated: 2026-04-07 Session 1_

---

## Usage Instructions

After every session, add a new observation block below using this template:

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

---

## Session 1 — 2026-04-07

### Files created/modified
- `app/layout.tsx` — root layout, CSS vars, Google Fonts, metadata
- `app/page.tsx` — full homepage (10 sections, ~1400 lines — known technical debt)
- `app/components/HeroCanvas.tsx` — Three.js canvas, CDN loaded, SSR disabled
- `app/admin/page.tsx` — enquiry dashboard with real-time Supabase subscription
- `app/auth/login/page.tsx` — email/password admin login
- `app/auth/callback/route.ts` — OAuth callback handler
- `app/api/enquiry/route.ts` — POST enquiry, Resend email notification
- `app/api/enquiry/[id]/route.ts` — PATCH status update (auth-protected)
- `lib/supabase.ts` — browser client + helpers
- `proxy.ts` — middleware protecting /admin
- `supabase/migrations/001_initial_schema.sql` — enquiries + profiles tables
- `.env.local` — template (unfilled)
- `.env.example` — committed placeholders
- `.claude/CLAUDE.md` — standing instructions
- `CLAUDE_CONTEXT.md` — session brain

### Test health
- Tests passing: 0/0 (no test suite yet — critical debt item)
- New tests added: 0
- Tests removed: 0

### Patterns documented
- **Three.js CDN pattern**: loaded via script tag in useEffect, never npm. HeroCanvas uses `dynamic({ ssr: false })`
- **proxy.ts convention**: Next.js 16 uses `proxy.ts` with `proxy` export function, not `middleware.ts`
- **Single admin model**: No user signup flow. Admin created manually in Supabase dashboard. No trigger needed (profile inserted manually)
- **Email graceful degradation**: Resend wrapped in try/catch — enquiry saves to DB even if email fails

### Gaps identified
- **No test suite** — critical. No Vitest config, no unit tests, no integration tests. Every feature shipped without test coverage.
- **page.tsx is ~1400 lines** — well above the 500-line limit. Needs to be split into section components.
- **No develop branch** — all work committed to master. Need to establish develop → main PR workflow.
- **No GitHub Actions CI** — no automated TypeScript check, no test runner, no build validation.
- **No FEATURE.md process** — Session 1 was a fast build without the gate. All future features need FEATURE.md first.
- **bisxp.com domain not connected** — live on `bisxp-com.vercel.app` only.
- **hello@bisxp.com not verified in Resend** — email notifications will fail until domain verified.
- **No OG image** — missing `/api/og` for social sharing.

### Degradation signals
- [x] File size creep — page.tsx is ~1400 lines (critical — needs splitting)
- [ ] Test count decreased? — N/A (no tests yet)
- [ ] New duplicate code introduced? — No
- [ ] CSS hardcoded hex values? — No (all CSS variables)
- [ ] Console.log left in production code? — Not checked
- [ ] Missing loading states? — Form has loading state. Admin dashboard has loading state.
- [ ] Mobile not tested? — Visually confirmed working on local dev

### Suggestions for next session
- **Priority 1**: Set up Vitest + write unit tests for `/api/enquiry` and `/api/enquiry/[id]` — no more shipping without tests
- **Priority 2**: Create `develop` branch and set up GitHub Actions CI
- **Priority 3**: Split `app/page.tsx` into section components (HeroSection, StatsSection, etc.) to get under 500 lines
- **Priority 4**: Verify `bisxp.com` domain in Resend, connect DNS records
- **Priority 5**: Create FEATURE.md template in `docs/features/`

---

_This file is updated by Claude Code at each session end._
_Each observation block captures the health of the codebase at that point in time._
_Use degradation signals to catch quality erosion before it compounds._
