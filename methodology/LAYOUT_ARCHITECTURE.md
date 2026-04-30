# BISXP Methodology Addendum — Layout Architecture
# Applies to: ALL future BISXP projects
# Added: 2026-04-29 — learned from MLCA Seattle nav refactor
# Location: C:\Users\taher\bisxp-com\methodology\LAYOUT_ARCHITECTURE.md

---

## WHY THIS EXISTS

On MLCA Seattle, navigation code ended up scattered across 6 different
files across 9 sessions. The fix required a dedicated refactor session.
Root cause: no layout architecture was defined before the first page
was built. This document prevents that from ever happening again.

---

## THE RULE (applies to every project, every time)

> **Navigation is designed once, in Session 1, before any page is built.**
> **It is implemented as a root layout. No page ever contains its own navbar.**

---

## SESSION 1 CHECKLIST — Layout Architecture Gate

Before writing the first page of any project, answer these questions
in the project's `CLAUDE_CONTEXT.md` under a **Layout Architecture** section:

```markdown
## Layout Architecture

### Navigation components
- Top nav component: [filename] — [desktop behavior]
- Bottom nav component: [filename or "none"] — [mobile behavior]
- Root layout file: [app/layout.tsx or equivalent]

### Shared layout wrapper
- All public pages wrapped by: [layout file]
- Admin pages wrapped by: [layout file or "excluded via CSS"]
- Auth pages wrapped by: [layout file or "excluded — redirect only"]

### Body spacing
- padding-top: [Npx] — compensates for sticky top nav height
- padding-bottom: [Npx + safe-area] — compensates for mobile bottom nav
- Managed in: [root layout file — NOT per page]

### Nav link list (desktop + mobile)
| Label | Route | Active when |
|---|---|---|
| [label] | [/route] | [pathname condition] |

### Per-page nav contract
Every new page added to this project must:
- [ ] Inherit navigation automatically from the root layout
- [ ] NOT contain its own navbar, bottom nav, or AuthButton in a header
- [ ] NOT add padding-top to compensate for the navbar (root layout handles it)
- [ ] Declare which nav item highlights when on this page
```

This section must be completed and committed **before** any page.tsx is written.

---

## FEATURE.MD MANDATE — Layout & Navigation Section

Every FEATURE.md for a new page must include this section:

```markdown
## Layout & Navigation

### Page type
[ ] Public — inherits shared layout automatically
[ ] Admin — nested under /admin, public nav excluded by CSS
[ ] Auth — redirect-only, nav excluded

### Nav integration
- Active nav item on desktop: [which link highlights]
- Active nav item on mobile: [which bottom nav slot highlights]
- Back link: [← where, or none]

### Layout contract
- [ ] This page does NOT contain its own navbar
- [ ] This page does NOT wire its own bottom nav
- [ ] This page does NOT add padding-top for navbar offset
- [ ] Body spacing handled by root layout
```

If this section is missing → STOP. Do not build the page.
Ask Shah to approve the layout section first.

---

## IMPLEMENTATION PATTERN (Next.js App Router)

The correct implementation for multi-tenant projects:

```typescript
// app/components/NavShell.tsx — server component
// Reads host → derives theme → renders SiteNav with correct branding
import { headers } from 'next/headers'
import { getAcademyId, getAcademyTheme } from '@/lib/academy'
import SiteNav from './SiteNav'

export default async function NavShell() {
  const host = (await headers()).get('host') ?? ''
  const academyId = getAcademyId(host)
  const theme = getAcademyTheme(host)
  return <SiteNav theme={theme} academyId={academyId} />
}
```

```typescript
// app/layout.tsx — root layout
// NavShell wraps every page automatically — no per-page nav wiring needed
import NavShell from '@/app/components/NavShell'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavShell />
        <div style={{ paddingTop: 64 }}>
          {children}
        </div>
      </body>
    </html>
  )
}
```

```typescript
// app/components/SiteNav.tsx — client component
// Single source of truth for ALL navigation on ALL public pages
// Desktop: sticky top bar with logo + links + auth
// Mobile: fixed bottom bar with icon nav
'use client'
// ... renders both desktop top nav AND mobile bottom nav
// className="site-top-nav" on top nav element
// className="site-bottom-nav" on bottom nav element
```

```typescript
// app/admin/components/AdminShell.tsx — admin layout
// Hides public SiteNav with CSS — admin has its own nav
<style dangerouslySetInnerHTML={{ __html: `
  .site-top-nav, .site-bottom-nav { display: none !important; }
` }} />
```

---

## VIOLATION SIGNALS — What to watch for in code review

Any of these in a PR = blocked until fixed:

| Code pattern | Violation | Fix |
|---|---|---|
| `<nav>` inside a page component | Page managing its own nav | Remove, root layout handles it |
| `<BottomNav />` inside a page client component | Scattered nav wiring | Remove, SiteNav handles it |
| `import AuthButton` in a hero/header component | Auth in wrong place | Remove, SiteNav provides it |
| `paddingTop: 64` or `marginTop: 64` in page hero | Compensating for missing layout padding | Remove, root layout handles it |
| Nav links copy-pasted between pages | DRY violation | Extract to SiteNav |

---

## DEGRADATION SIGNALS — Add to SESSION_OBSERVATIONS.md

Check these every session end:

```markdown
### Navigation health
- [ ] Nav code exists only in SiteNav.tsx? (grep for <nav> in page components)
- [ ] BottomNav imported anywhere outside SiteNav? (grep for BottomNav)
- [ ] AuthButton imported in any hero/header? (grep for AuthButton import in non-SiteNav files)
- [ ] Per-page padding-top hacks for navbar? (grep for paddingTop: 64 in page components)
```

If any box is unchecked → log as debt and fix in next session.

---

## THE LESSON — FOR THE RECORD

MLCA Seattle Sessions 1–8 built the following without a shared layout:
- Session 1: HomeClient.tsx with inline navbar
- Session 4: FeedClient.tsx with custom header, no navbar
- Session 5: AuthButton added to home navbar only
- Session 6: StatsClient.tsx, TeamPageClient.tsx — no navbar
- Session 7: PlayerHero.tsx — no navbar
- Session 8: AuthButton added to each page individually
- Session 8: BottomNav wired into 5 different page components separately
- Session 9: Full SiteNav refactor required — dedicated session wasted

Total cost: 1 full refactor session + nav bugs in production.

If the Layout Architecture section had been written in Session 1 FEATURE.md,
none of these sessions would have touched navigation code after the first time.

---

_This addendum is mandatory reading for Session 1 of every new BISXP project._
_File: C:\Users\taher\bisxp-com\methodology\LAYOUT_ARCHITECTURE.md_
_Cross-referenced in: BISXP_METHODOLOGY.md Section 3 (Build Sequence)_
