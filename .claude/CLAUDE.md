# BISXP.COM — Standing Instructions

## Project
BISXP consultancy website. bisxp.com.
Repo: tafzal2025-cloud/bisxp-com
Local: C:\Users\taher\bisxp-com

## Stack
- Next.js 16 (App Router)
- TypeScript strict
- Supabase (auth + DB)
- Resend (transactional email)
- Vercel (deploy)
- NO Tailwind — inline styles + CSS variables only
- NO UI component libraries (no shadcn, no MUI, no Chakra)
- NO three npm package — Three.js loaded via CDN in useEffect

## Session Start
1. Read CLAUDE_CONTEXT.md (project brain)
2. Check git log for last session's work
3. Read relevant files before editing

## Session End
1. Update CLAUDE_CONTEXT.md with what was done, what's pending
2. Commit: "Session N: brief summary"
3. Do NOT push — Shah pushes manually

---

## Brand Tokens (CSS Variables — defined in app/layout.tsx)

--obsidian: #08080A
--charcoal: #131318
--steel:    #1E1E26
--amber:    #D4A843
--amber-bright: #F0C060
--amber-dim: rgba(212,168,67,0.15)
--cream:    #F0EBE0
--white:    #FAFAF8
--muted:    #70707A
--border:   rgba(212,168,67,0.12)
--border-strong: rgba(212,168,67,0.3)

Fonts: Cormorant Garamond (headings 300/400/600) + Outfit (body 300/400/500/600)
Logo: BISX in --cream, P in --amber

---

## CSS Pattern

ALL styles use inline <style> tags with CSS variables. Never Tailwind. Never hardcoded hex colors.

---

## Supabase Patterns

Browser client: createAuthClient() — ALWAYS inside useMemo() in client components
Server client: createServerClient from @supabase/ssr with cookies()
Auth check: ALWAYS getUser(), never getSession()
Service role: createClient(url, SUPABASE_SERVICE_ROLE_KEY) for RLS bypass

---

## File Conventions
- Middleware: proxy.ts (NOT middleware.ts)
- Dynamic route params: { params }: { params: Promise<{ id: string }> } then await params
- Every API route: export const maxDuration = 60
- SSR-unsafe components: dynamic(() => import(...), { ssr: false })

---

## NEVER DO
- Tailwind classes anywhere
- Hardcode hex colors — always use CSS variables
- middleware.ts — use proxy.ts
- supabase.auth.getSession() — use getUser()
- createAuthClient() outside useMemo() in client components
- export const config = {} in page/layout files
- await params without Promise<{...}> type annotation
- npm install three — always CDN via script tag in useEffect
- Commit .env.local or any real secrets
- Push to remote without Shah's instruction

---

## ALWAYS DO
- Read a file before editing it
- export const maxDuration = 60 on every API route
- Mobile-responsive on every section
- getUser() for auth, service role for data writes with RLS bypass
- Update CLAUDE_CONTEXT.md at session end
- Commit with clear session summary

---

## Database Tables
- enquiries — all contact form submissions, status workflow
- profiles — admin user profiles (auto-created via trigger on auth.users)

## Environment Variables
See .env.example for all keys. Fill in .env.local (never commit it).

---
---

# Demo Suite — Standing Instructions
Applies to all files in public/demos/

## Overview
Static HTML demo files — no React, no build step, no imports. Each file is fully self-contained.
AI calls go through the Next.js proxy at /api/ai — Anthropic API.
Deployed at bisxp-com.vercel.app/demos/

Active verticals:
- bisxp-mastercard-demo.html      — 3 workflows, 5 human gates, accent #D4A843
- bisxp-healthcare-demo.html      — 5 workflows, 7 human gates, accent #0EA5A0
- bisxp-insurance-demo.html       — 1 workflow,  2 human gates, accent #818CF8
- bisxp-government-demo.html      — 1 workflow,  2 human gates, accent #2DD4BF
- bisxp-customer-service-demo.html— 3 workflows, 4 human gates, accent #EC4899
- index.html + bisxp-demo-index.html — landing page (theme switcher: Dark/Arctic/Signal)

Skipped verticals (do not build): HR, Legal, Supply Chain.

---

## CSS Rules — Never Break These

### RULE 1: No ::before or ::after inside BVA grid cells
Never add ::before or ::after to .bva-cell, .bva-ai, or .bva-h.

Why it breaks: .bva-grid uses display:grid with grid-template-columns.
Adding display:block via ::before forces cells to grow vertically —
all cells stack in a single column instead of a horizontal row.

CORRECT — use border-top to distinguish AI vs human cells:
  .bva-ai { border-top: 3px solid rgba(59,130,246,0.5); }
  .bva-h  { border-top: 3px solid var(--ac); font-weight: 700; }

WRONG:
  .bva-ai::before { content: "AI"; display: block; }
  .bva-h::before  { content: "HG"; display: block; }

### RULE 2: Always use .bva-val-t — never .bva-val
.bva-val collides with pipeline step dot selectors and causes step
numbers to display as percentages instead of 1-8.

### RULE 3: Print styles must stay inside win.document.write() only
Never inject a <style> block into the main page DOM from JavaScript.
Print CSS class names (.ps, .pg, .pk, .pv, .pd) collide with pipeline
step classes (.ps-run, .ps-ok), corrupting step status badges.

---

## JavaScript Rules

### RULE 4: Escape \n in regex inside Python-generated JS
Use \\n not \n in regex literals when writing JS inside Python strings.

Why it breaks: A literal newline inside /pattern\n?/g produces
SyntaxError: Invalid regular expression — stops the entire script block,
making run0() and all functions undefined.

CORRECT:  t.replace(/```json\n?/g, '')
WRONG:    t.replace(/```json
?/g, '')   <-- literal newline

### RULE 5: Step dot checkmarks must use Unicode directly
Use the character U+2713 (✓) not the HTML entity &#10003; via textContent.

Why it breaks: element.textContent = '&#10003;' renders the literal
string "&#10003;" — HTML entities are only decoded by innerHTML.

CORRECT:  el.querySelector('.step-d').textContent = '\u2713';
WRONG:    el.querySelector('.step-d').textContent = '&#10003;';

### RULE 6: BVA before values must be proportional per-step minutes
Each step's before value = realistic time for that step in minutes,
NOT the total workflow duration repeated for every step.

Why it breaks: Equal large values per step multiply to impossible totals
(e.g. 330 days for a 30-day claims process).

CORRECT — proportional, sums to ~21 days for a 30-day claims cycle:
  { l: 'FNOL triage',      before: 2880,  ai: 8,  human: 0 }
  { l: 'Fraud screening',  before: 4320,  ai: 12, human: 900 }
  { l: 'Damage valuation', before: 7200,  ai: 12, human: 0 }

WRONG — same 30-day value for every step:
  { l: 'FNOL triage',      before: 43200, ai: 8,  human: 0 }
  { l: 'Fraud screening',  before: 43200, ai: 12, human: 900 }

### RULE 7: setTimeout appears exactly once per demo file
The only permitted setTimeout is the toast auto-dismiss:
  setTimeout(() => el.classList.remove('show'), 5000);
Any additional setTimeout is a bug. No fake delays in pipeline steps.

### RULE 8: Human gates must never auto-resolve
Human gate Promises resolve ONLY on button click. Never add a timeout fallback.

CORRECT:
  function waitH(key) { return new Promise(res => { hRes[key] = res; }); }

WRONG:
  function waitH(key) { return new Promise(res => {
    hRes[key] = res;
    setTimeout(() => res('auto'), 5000);  // defeats the purpose
  }); }

---

## Architecture Rules

### RULE 9: One file per vertical — fully self-contained
All tabs, all workflows, all JS for a vertical live in a single HTML file.
No imports, no shared JS files, no cross-file dependencies.

### RULE 10: PDF accent colour matches vertical accent
Each vertical's printCaseFile() must use the correct accent:
  Financial:        #D4A843
  Healthcare:       #0EA5A0
  Insurance:        #818CF8
  Government:       #2DD4BF
  Customer Service: #EC4899

---

## Quick Debugging Reference

Symptom                          | Cause                              | Fix
---------------------------------|------------------------------------|------------------------------------------
HITL cells stacking vertically   | ::before with display:block        | Remove ::before, use border-top
Step dots show &#10003;          | HTML entity via textContent        | Use '\u2713' directly
Step dots show percentages       | .bva-val class conflict            | Rename to .bva-val-t
run0 is not defined              | SyntaxError stops script parsing   | Fix regex literal newlines
BVA chart shows wrong totals     | before values too large or equal   | Use proportional per-step minutes
Print PDF corrupts step badges   | <style> injected into main page    | Keep print styles in win.document.write()
Send/DocuSign buttons do nothing | Env vars not set in Vercel         | Add RESEND_API_KEY to Vercel env vars