# Session Contract — BISXP.com
_The binding agreement between Claude.ai, Claude Code, and Shah for every bisxp-com session._
_Adapted from TABRO.IN SESSION_CONTRACT.md._
_Last updated: 2026-04-07_

---

## Roles

### Claude.ai (Architect)
- Designs features via FEATURE.md documents
- Reviews Claude Code output for SOLID compliance
- Provides instructions in fenced code blocks for one-click copy
- Never writes code directly into the codebase
- Maintains the Platform Bible (BISXP-CLAUDE.md)

### Claude Code (Builder)
- Reads CLAUDE_CONTEXT.md, BISXP-CLAUDE.md, TECHNICAL_DEBT.md, SESSION_OBSERVATIONS.md before every session
- Writes code, tests, migrations, and documentation
- Follows all rules in CLAUDE.md and BISXP-CLAUDE.md without exception
- Produces SESSION START REPORT and SESSION OBSERVATION BLOCK every session
- Never pushes to `main` — always `develop`

### Shah (Owner)
- Approves FEATURE.md before Claude Code begins building
- Reviews PRs via GitHub
- Makes final deployment decisions
- Resolves ambiguity when Claude.ai and Claude Code disagree
- Has final say on all architectural decisions

---

## Non-Negotiable Rules

1. **FEATURE.md before code.** No feature work begins without an approved FEATURE.md in `docs/features/`. Escape hatches listed below are the only exceptions.

2. **Tests before merge.** Every PR must maintain or increase the test count. Test count regression blocks merge.

3. **No file exceeds 500 lines.** Files over 500 lines must be split before merge.

4. **No direct push to main.** All changes go through `develop` branch first, then PR to `main`.

5. **SOLID checkpoint per feature.** Every feature gets a SOLID self-audit before the PR is opened.

6. **Session artifacts are mandatory.** Every session updates CLAUDE_CONTEXT.md and SESSION_OBSERVATIONS.md. No exceptions.

7. **No secrets in code.** Environment variables for all keys, PINs, and credentials. Accidentally committed secrets must be rotated immediately.

8. **CSS variables only.** No hardcoded hex colors anywhere. Use the brand CSS variables defined in BISXP-CLAUDE.md.

9. **Mobile first.** Every UI change must work on 390px before desktop.

10. **The site exists to convert visitors into enquiries.** Every feature must serve that goal or be deprioritised.

---

## Branch Strategy

### main
- Production branch, auto-deploys to Vercel
- Protected: no direct pushes, requires PR with passing CI
- Only receives merges from `develop` via PR

### develop
- Integration branch for all session work
- Claude Code pushes here after each session
- CI runs on every push

---

## Escape Hatches

These are the only cases where the FEATURE.md gate can be skipped:

### 1. Bug Fix
- **When**: Production bug that needs immediate fix
- **Rule**: Commit prefix `fix:`, tests required, PR still required
- **Skip**: FEATURE.md not needed

### 2. Test-Only
- **When**: Adding tests for existing code, no behavior change
- **Rule**: Commit prefix `test:`, no app code changes
- **Skip**: FEATURE.md not needed

### 3. Hotfix
- **When**: Critical production issue (site down, form broken, data loss)
- **Rule**: Can push to `main` if urgent, but must open follow-up PR documenting the change
- **Skip**: FEATURE.md and PR can be retroactive

### 4. Docs/CI Only
- **When**: Documentation updates, CI pipeline changes, config files
- **Rule**: Commit prefix `docs:` or `ci:`, no app code changes
- **Skip**: FEATURE.md not needed

---

## BISXP-Specific Rules

These rules are specific to BISXP.com and override general patterns where they conflict:

### Single admin model
- One admin user only — created manually in Supabase dashboard
- No self-registration flow — this is intentional and permanent
- No role system, no capability flags, no multi-tenancy

### Three.js
- Never installed via npm — CDN only
- Always loaded in `useEffect` with SSR disabled via `dynamic({ ssr: false })`
- If Three.js hero breaks site performance, it gets removed — the form comes first

### Email
- Resend account is BISXP-specific (separate from TABRO Resend account)
- From address: `hello@bisxp.com`
- Email failure never fails the user-facing request

### Proxy.ts
- Named `proxy.ts` not `middleware.ts`
- Exports `proxy` function not `middleware`
- This is the BISXP/TABRO/TheUnitedSports convention for Next.js 16

---

## Day 1 Developer Onboarding

If a new developer joins the project, they must complete this list before writing any code:

1. Read `CLAUDE.md` — project-level standing rules
2. Read `CLAUDE_CONTEXT.md` — full architecture snapshot
3. Read `BISXP-CLAUDE.md` — engineering manual
4. Read `TECHNICAL_DEBT.md` — known debt and priorities
5. Read `SESSION_OBSERVATIONS.md` — recent session history
6. Read `SESSION_CONTRACT.md` — this file
7. Run `npm test` — verify all tests pass locally
8. Run `npx tsc --noEmit` — verify no TypeScript errors
9. Run `npm run dev` — verify the app starts locally
10. Ask Shah if anything is unclear — never guess on architecture decisions

---

_This contract is enforced by CI, PR review, and session discipline._
_Violations are logged in SESSION_OBSERVATIONS.md as degradation signals._
