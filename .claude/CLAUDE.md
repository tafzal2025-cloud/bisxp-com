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

```css
--obsidian: #08080A
--charcoal: #131318
--steel: #1E1E26
--amber: #D4A843
--amber-bright: #F0C060
--amber-dim: rgba(212,168,67,0.15)
--cream: #F0EBE0
--white: #FAFAF8
--muted: #70707A
--border: rgba(212,168,67,0.12)
--border-strong: rgba(212,168,67,0.3)
```

Fonts: Cormorant Garamond (headings, 300/400/600) + Outfit (body, 300/400/500/600)
Logo: BISX in --cream, P in --amber

---

## CSS Pattern

ALL styles use inline `<style>` tags with CSS variables. Never Tailwind. Never hardcoded hex colors.

```tsx
<>
  <style>{`
    .my-component { background: var(--obsidian); color: var(--cream); }
  `}</style>
  <div className="my-component">...</div>
</>
```

---

## Supabase Patterns

### Browser client (client components)
```ts
// lib/supabase.ts exports createAuthClient()
// ALWAYS inside useMemo() in client components:
const supabase = useMemo(() => createAuthClient(), [])
```

### Server client (API routes, server components)
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const cookieStore = await cookies()
const supabase = createServerClient(url, anonKey, {
  cookies: {
    getAll() { return cookieStore.getAll() },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
    },
  },
})
```

### Auth check in server context
```ts
// ALWAYS getUser(), never getSession()
const { data: { user } } = await supabase.auth.getUser()
```

### Service role (RLS bypass)
```ts
import { createClient } from '@supabase/supabase-js'
const serviceClient = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!)
```

---

## File Conventions
- Middleware: `proxy.ts` (NOT middleware.ts) — Next.js 16 convention
- Dynamic route params: `{ params }: { params: Promise<{ id: string }> }` then `await params`
- Every API route: `export const maxDuration = 60`
- SSR-unsafe components (Three.js): `dynamic(() => import(...), { ssr: false })`

---

## NEVER DO
- ❌ Tailwind classes anywhere
- ❌ Hardcode hex colors — always use CSS variables
- ❌ `middleware.ts` — use `proxy.ts`
- ❌ `supabase.auth.getSession()` — use `getUser()`
- ❌ `createAuthClient()` outside `useMemo()` in client components
- ❌ `export const config = {}` in page/layout files (Pages Router pattern)
- ❌ `await params` without `Promise<{...}>` type annotation
- ❌ `npm install three` — always CDN via script tag in useEffect
- ❌ Commit `.env.local` or any real secrets
- ❌ Push to remote without Shah's instruction

---

## ALWAYS DO
- ✅ Read a file before editing it
- ✅ `export const maxDuration = 60` on every API route
- ✅ Mobile-responsive on every section (check mentally)
- ✅ `getUser()` for auth, service role for data writes with RLS bypass
- ✅ Update CLAUDE_CONTEXT.md at session end
- ✅ Commit with clear session summary

---

## Database Tables
- `enquiries` — all contact form submissions, status workflow
- `profiles` — admin user profiles (auto-created via trigger on auth.users)

## Environment Variables
See .env.example for all keys. Fill in .env.local (never commit it).
