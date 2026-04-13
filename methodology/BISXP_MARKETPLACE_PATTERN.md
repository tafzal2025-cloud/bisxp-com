# BISXP Marketplace Pattern
_Canonical reference for all BISXP-built marketplaces_
_Version 1.0 — April 2026_
_Authored from learnings across Starlight Meadows, TABRO, and Fetespace_

---

## 1. What This Document Is

This is the BISXP repeatable marketplace pattern. Every marketplace BISXP builds — whether for a client engagement or as a BISXP-owned product — follows this pattern. Fetespace is the reference implementation. TABRO.IN and TABRO.COM are the second deployments.

The pattern defines:
- What every marketplace must have (non-negotiable)
- How each piece is architected (canonical decisions)
- What varies per deployment (market configuration)
- How sessions are structured (process discipline)

When a new marketplace is started, this document is read first. When a session is planned, this document is the spec against which the session is audited.

---

## 2. The Marketplace Model

Every BISXP marketplace connects three sides:

```
Customers ←→ Platform ←→ Listing Owners (Venues + Vendors)
                ↑
           Admin layer
```

**Customers** discover and enquire. They get curated discovery, AI-assisted planning, and trusted reviews.

**Listing Owners** get qualified leads, a self-service management portal, and SaaS tier upgrades that unlock more features.

**Admin** manages the platform — approves claims, links accounts, manages listings, monitors enquiries, configures settings.

The platform earns through SaaS subscriptions, transaction commissions, and featured placements.

---

## 3. The Six Mandatory Modules

Every marketplace must have all six. No marketplace ships without all six in place. Sessions are planned against these modules — not against ad hoc feature lists.

### Module 1 — Public Discovery Layer
The customer-facing marketplace.

**Required pages:**
- Homepage — hero, featured listings, categories, how it works, for owners CTA
- Venue listing page — filter by category/city, card grid, auth-aware navbar
- Venue detail page — hero, stats, about, amenities, event types, packages, enquiry form
- Vendor listing page — filter by category, card grid
- Vendor detail page — hero, stats, about, services, packages, enquiry form
- Claim/list page — dual path: new listing (Path A) + claim existing (Path B), type param (venue/vendor)

**Required behaviour:**
- All public queries filter `is_demo=false` and `is_active=true`
- Enquiry form on both venue and vendor detail pages posts to single `/api/enquiry`
- Claim banner on detail pages only when `claimed=false`
- Auth-aware navbar on every public page (avatar when logged in, Sign In when logged out)
- Mobile bottom tab bar hidden on portal pages (`return null`, never `display:none`)
- Featured listings ordered: `featured DESC, sort_order ASC, created_at DESC`

### Module 2 — Enquiry Pipeline
The revenue-generating core. Every enquiry from any listing flows through one unified pipeline.

**Required schema:**
```sql
enquiries (
  id uuid,
  listing_id uuid,      -- venue FK
  listing_name text,
  listing_slug text,
  vendor_id uuid,       -- vendor FK
  vendor_name text,
  vendor_slug text,
  name text NOT NULL,
  phone text NOT NULL,  -- mandatory, validated
  email text,           -- optional
  event_type text,
  event_date date,
  guest_count integer,
  message text,
  status text DEFAULT 'new',  -- new/contacted/site_visit/closed_won/closed_lost
  notes text,
  closure_reason text,
  created_at timestamptz,
  updated_at timestamptz
)
```

**Status pipeline:** new → contacted → site_visit → closed_won / closed_lost

**Required behaviour:**
- Single `POST /api/enquiry` handles both venue and vendor enquiries
- Email notification to owner on new enquiry (non-blocking, fire-and-forget)
- Email confirmation to customer (if email provided)
- Phone validation: mandatory, market-specific format (US 10-digit, India 10-digit)
- Email: optional on all enquiry forms

### Module 3 — Listing Owner Portal
Self-service portal for venue owners. This is a complete, standalone deliverable — not a collection of features added across sessions.

**Required tabs (in order):**
1. **Profile** — all editable fields: name, description, location, capacity, price, amenities (tag input), event types (tag input), contact, social links
2. **Photos** — upload (multipart to Supabase Storage, max 4MB) + URL paste + hero photo selection + delete. Grid display 3-col.
3. **Packages** — CRUD against `bisxp_packages` table. Add/edit/delete/toggle active. Syncs to `packages` jsonb on listing row.
4. **Enquiries** — full pipeline view. Status dropdown per row. Expandable row with notes (auto-save on blur). WhatsApp link.

**Auth pattern:**
- Bearer token (Google OAuth via Supabase)
- Token stored in `localStorage` keyed per slug: `fs_owner_token_[slug]`
- Auto-verifies on return visit — no re-entry required
- Lock button clears stored token
- All API routes verify via `supabase.auth.getUser(token)` then check `bisxp_profiles.linked_listing_slug === slug`

**Tier enforcement:**
- Profile tab: always unlocked
- Photos, Packages, Enquiries: locked for basic tier
- Locked tab shows `LockedTabCard` component with upgrade CTA
- Tab label shows lock indicator when locked

**Portal navbar (canonical pattern):**
- Logo: `<Link href="/">` — ALWAYS a Next.js Link, never a span or div
- Entity name + portal badge
- "View Listing" link → public detail page (new tab)
- Sign Out button
- `BottomTabBar` returns `null` on all portal paths

### Module 4 — Vendor Owner Portal
Self-service portal for vendor owners. Mirror of Listing Owner Portal with vendor-specific fields.

**Required tabs (in order):**
1. **Profile** — name, short description (160 char), description (800 char), city, state, service area, website, instagram, phone, whatsapp. Category: display only.
2. **Photos** — same pattern as venue portal
3. **Packages** — same pattern as venue portal
4. **Enquiries** — same pattern as venue portal

**Auth pattern:**
- Same Bearer token pattern as venue portal
- Check `bisxp_profiles.linked_vendor_slug === slug`
- Admin links vendor accounts via dashboard: email input → find auth user → upsert profile with `role='vendor'`, `linked_vendor_slug`

**Route:** `/vendor/[slug]` — separate from venue portal at `/owner/[slug]`

### Module 5 — Admin Dashboard
Central management for the platform operator. This is a complete deliverable with five tabs.

**Required tabs (in order):**
1. **Venues** — full CRUD table. Columns: Name | City | Tier | Active | Featured | Actions. Add/Edit modal with all fields. Toggle active. Delete with confirm.
2. **Vendors** — mirror of Venues tab for vendor table. Includes account linking: email input → link/unlink Google account to vendor slug.
3. **Claims** — all claim requests with type filter (venue/vendor). Status actions: approve/contact/reject. Notes field per claim (auto-save).
4. **Enquiries** — full pipeline. Status filter pills. Type filter (venue/vendor). Expandable rows with notes (auto-save).
5. **Settings** — platform configuration from `bisxp_settings` table. Tier pricing, platform emails, feature flags.

**Auth:** PIN gate (`DASHBOARD_PIN` env var) stored in `sessionStorage`. All `/api/admin/*` routes check `x-admin-pin` header.

**Add/Edit Modal (canonical pattern):**
- Single modal component controlled by `{ open, mode, entityType, data }` state
- Overlay: `position: fixed; inset: 0; rgba(0,0,0,0.7); z-index: 200`
- Card: dark bg, max-width 600px, max-height 85vh, overflow-y auto
- Close: X button + click overlay
- Slug: auto-generated from name, editable
- Arrays (amenities, event_types): comma-separated text input, split on save
- Save: POST (add) or PATCH (edit) → refetch list → close modal

### Module 6 — Platform Infrastructure
The non-visible layer that makes everything work.

**Required:**
- Migration files: every SQL change saved to `supabase/migrations/NNN_description.sql` before running
- `bisxp_settings` table: key/value platform config, editable via admin
- `bisxp_packages` table: shared by venues and vendors, syncs to `packages` jsonb on parent row
- Storage bucket: `[market]-media` (public), paths: `listings/[slug]/photos/`, `vendors/[slug]/photos/`
- Email: Resend from verified domain, non-blocking on enquiry
- Proxy/middleware: protects `/owner/*`, `/vendor/*`, `/my/*`, `/dashboard` — export named `proxy` not `middleware`
- Auth callback: role-based redirect order: vendor → owner → admin → customer
- `CLAUDE_CONTEXT.md`: updated at the end of every session
- `SESSION_OBSERVATIONS.md`: hard lessons recorded after every session

---

## 4. The Database Schema

### Core tables (every marketplace)

```sql
-- Venue listings
bisxp_listings (
  id uuid PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text,
  short_description text,
  description text,
  location text,
  area text,
  city text,
  state text DEFAULT 'WA',  -- market-specific
  zip text,
  tier text DEFAULT 'basic' CHECK (tier IN ('basic','professional','premium')),
  claimed boolean DEFAULT false,
  is_active boolean DEFAULT true,
  is_demo boolean DEFAULT false,
  owner_name text,
  owner_phone text,
  owner_email text,
  photos text[] DEFAULT '{}',
  videos text[] DEFAULT '{}',
  hero_photo text,
  packages jsonb,            -- synced from bisxp_packages, read by public API
  amenities text[] DEFAULT '{}',
  event_types text[] DEFAULT '{}',
  capacity integer,
  price_from numeric,
  price_to numeric,
  currency text DEFAULT 'USD',
  website text,
  instagram text,
  facebook text,
  youtube text,
  whatsapp text,
  hero_gradient text,
  featured boolean DEFAULT false,
  homepage_spotlight boolean DEFAULT false,
  sort_order integer,
  rating numeric(3,1),
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

-- Vendor listings
bisxp_vendors (
  -- same structure as bisxp_listings plus:
  vendor_score numeric,      -- AI-scored quality
  score_breakdown jsonb,
  service_area text
)

-- Packages (shared by venues and vendors)
bisxp_packages (
  id uuid PRIMARY KEY,
  listing_id uuid REFERENCES bisxp_listings(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES bisxp_vendors(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10,2),
  price_label text,          -- 'per event','per person','starting from','contact for pricing'
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT bisxp_packages_owner_check CHECK (
    (listing_id IS NOT NULL AND vendor_id IS NULL) OR
    (listing_id IS NULL AND vendor_id IS NOT NULL)
  )
)

-- User profiles
bisxp_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  role text DEFAULT 'customer' CHECK (role IN ('customer','owner','vendor','admin')),
  display_name text,
  phone text,
  linked_listing_slug text,  -- venue owner link
  linked_vendor_slug text,   -- vendor owner link
  referral_code text,
  created_at timestamptz DEFAULT now()
)

-- Enquiries
bisxp_enquiries (
  id uuid PRIMARY KEY,
  listing_id uuid,
  listing_name text,
  listing_slug text,
  vendor_id uuid,
  vendor_name text,
  vendor_slug text,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  event_type text,
  event_date date,
  guest_count integer,
  message text,
  status text DEFAULT 'new',
  notes text,
  closure_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

-- Claim requests
bisxp_claim_requests (
  id uuid PRIMARY KEY,
  type text DEFAULT 'venue' CHECK (type IN ('venue','vendor')),
  listing_name text NOT NULL,
  listing_slug text,
  vendor_slug text,
  owner_name text NOT NULL,
  owner_phone text NOT NULL,
  owner_email text,
  tier_interest text,
  message text,
  notes text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
)

-- Platform settings
bisxp_settings (
  key text PRIMARY KEY,
  value text,
  label text,
  section text,
  sort_order integer
)
```

### Design rules (non-negotiable)
- All PKs: `uuid DEFAULT gen_random_uuid()`
- All timestamps: `timestamptz DEFAULT now()`
- Soft deletes: `is_active boolean DEFAULT true` — never hard delete customer-facing data
- Array columns: `text[] DEFAULT '{}'`
- Never drop or rename columns — only `ADD COLUMN IF NOT EXISTS`
- All SQL changes saved as numbered migration files before running
- `bisxp_packages` syncs to parent `packages jsonb` after every write

---

## 5. The API Route Architecture

```
/api/listings          — GET paginated venues (public, is_demo=false filter)
/api/listings/[slug]   — GET single venue (public)
/api/vendors           — GET paginated vendors (public)
/api/vendors/[slug]    — GET single vendor (public)
/api/enquiry           — POST enquiry (public, handles both venues and vendors)
/api/settings          — GET platform settings (public)

/api/owner/[slug]                    — GET+PATCH venue (Bearer token)
/api/owner/[slug]/photos             — POST+DELETE photos (Bearer token)
/api/owner/[slug]/photos/upload      — POST multipart upload (Bearer token)
/api/owner/[slug]/packages           — GET+POST packages (Bearer token)
/api/owner/[slug]/packages/[id]      — PATCH+DELETE package (Bearer token)
/api/owner/[slug]/enquiries          — GET enquiries (Bearer token)
/api/owner/[slug]/enquiries/[id]     — PATCH status/notes (Bearer token)

/api/vendor/me                       — GET linked slug (Bearer token)
/api/vendor/[slug]                   — GET+PATCH vendor (Bearer token)
/api/vendor/[slug]/photos            — POST+DELETE photos (Bearer token)
/api/vendor/[slug]/photos/upload     — POST multipart upload (Bearer token)
/api/vendor/[slug]/packages          — GET+POST packages (Bearer token)
/api/vendor/[slug]/packages/[id]     — PATCH+DELETE package (Bearer token)
/api/vendor/[slug]/enquiries         — GET enquiries (Bearer token)
/api/vendor/[slug]/enquiries/[id]    — PATCH status/notes (Bearer token)

/api/admin/venues                    — GET all+POST new (x-admin-pin)
/api/admin/venues/[id]               — PATCH+DELETE (x-admin-pin)
/api/admin/vendors                   — GET all+POST new (x-admin-pin)
/api/admin/vendors/[id]              — PATCH+DELETE (x-admin-pin)
/api/admin/vendors/[id]/link         — POST link Google account (x-admin-pin)
/api/admin/vendors/[id]/unlink       — POST unlink (x-admin-pin)
/api/admin/claims                    — GET+PATCH (x-admin-pin)
/api/admin/claims/[id]               — PATCH status/notes (x-admin-pin)
/api/admin/enquiries                 — GET+PATCH (x-admin-pin)
/api/admin/enquiries/[id]            — PATCH status/notes (x-admin-pin)
/api/admin/settings                  — GET+POST upsert (x-admin-pin)
/api/claim                           — POST claim/list request (public)
```

### Auth rules (non-negotiable)
- Public routes: no auth, `createServiceClient()`, always filter `is_demo=false`
- Owner/vendor routes: `supabase.auth.getUser(token)` — never `getSession()`
- Admin routes: `req.headers.get('x-admin-pin') === process.env.DASHBOARD_PIN`
- `createServiceClient()` for all DB writes — anon key silently fails on RLS tables
- `await params` in all dynamic routes — Next.js 16 requirement
- `export const maxDuration = 60` on upload routes

---

## 6. The Component Architecture

### Two navigation systems. Always exactly two. Never a third.

**Desktop navbar** (inline per page on public pages, fixed in portals):
- Logo: always `<Link href="/">` — never a span or div
- Public pages: center nav links, right auth buttons
- Portal pages: entity name, portal badge, view listing link, sign out
- Hidden on mobile via `@media (max-width: 768px)`

**Mobile BottomTabBar** (`app/components/BottomTabBar.tsx`):
- `return null` on portal paths: `/owner`, `/vendor`, `/dashboard`, `/auth`
- Never `display: none` or `visibility: hidden` — those still intercept pointer events
- 5 tabs: Home | Venues | Search/Feed | Vendors | Account
- Account tab: `/my/account` if logged in, `/auth/login` if logged out

### Tier enforcement (canonical component)

```typescript
// lib/tiers.ts
export function isPortalTabLocked(
  tier: string,
  tab: 'photos' | 'packages' | 'enquiries'
): boolean {
  const tierOrder: Record<string, number> = { basic: 0, professional: 1, premium: 2 }
  const tabRequirements: Record<string, number> = { photos: 1, packages: 1, enquiries: 1 }
  return (tierOrder[tier] ?? 0) < tabRequirements[tab]
}
```

**LockedTabCard (canonical component):**
- Dashed gold border, centered, lock icon, heading, description, upgrade CTA
- CTA: `mailto:hello@[domain]?subject=Upgrade Request - [slug]` until Stripe is live

### Photo upload (canonical pattern)
- Multipart POST to `/api/[owner|vendor]/[slug]/photos/upload`
- Max 4MB per file (Vercel body limit)
- Path: `[market]-media/[listings|vendors]/[slug]/photos/[timestamp]-[random].[ext]`
- After upload: append public URL to `photos[]` array on parent row
- URL paste fallback: text input + Add button
- Hero selection: click any photo → PATCH parent row `hero_photo`
- Delete: remove from array → PATCH parent row

### Package CRUD (canonical pattern)
- `bisxp_packages` table, filtered by `listing_id` or `vendor_id`
- After every write (POST/PATCH/DELETE): sync active packages to `packages jsonb` on parent row
- This keeps the public API unchanged — it reads from jsonb, not the packages table
- Inline add form (not modal), inline edit in-place
- Price labels: "per event" | "per person" | "starting from" | "contact for pricing"

---

## 7. The CSS Pattern

No Tailwind. Every page uses inline `<style>` tags with CSS variables.

```css
:root {
  /* Fetespace */
  --cream: #FDFCF8;
  --ink: #0F0F14;
  --gold: #C9A84C;
  --muted: #9A9080;
  --border: rgba(15,15,20,0.08);

  /* Admin/portal dark mode */
  --dark-bg: #0F0F14;
  --dark-surface: rgba(255,255,255,0.04);
  --dark-border: rgba(255,255,255,0.08);
}
```

Market-specific variable sets are defined per deployment. All components use variables — never hardcoded hex except in the variable definition itself.

---

## 8. The Session Protocol

This is non-negotiable. Every session, regardless of size, follows this protocol.

### Before every session (Claude.ai responsibility)
1. Read `CLAUDE_CONTEXT.md` in full
2. Read this pattern document
3. Identify which Module(s) the session touches
4. Write `FEATURE-Sn-[name].md` — full spec, zero ambiguity
5. Write `fetespace-sn-instruction.html` — HTML widget with Copy button, textarea + `t.select()` + `document.execCommand('copy')` pattern
6. Save both to `C:\Users\taher\Downloads\FeteSpace\`
7. Surface any architectural decisions as questions before building

### Every instruction widget must include
- `git pull` before starting
- Read `CLAUDE.md`, `BISXP-CLAUDE.md`, `CLAUDE_CONTEXT.md` before writing code
- All hard technical rules relevant to the session called out explicitly
- `npx tsc --noEmit` before every commit
- `npm test` before every commit
- Commit message in conventional commits format
- `git push origin develop`
- Update `CLAUDE_CONTEXT.md` — files created/modified, what was built
- Update `SESSION_OBSERVATIONS.md` — any new hard lessons

### Session scope discipline
- Each Module is a complete deliverable, not a collection of features
- A Module is never split across non-consecutive sessions
- Bug fixes get their own instruction widget — never verbal instructions
- No session touches more than two Modules (too large = drift)
- If a session reveals scope that wasn't anticipated, stop and plan before proceeding

### After every session (Claude.ai responsibility)
- Confirm `CLAUDE_CONTEXT.md` was updated
- Confirm `SESSION_OBSERVATIONS.md` was updated
- Note any gaps or deferred items explicitly
- Plan next session against the gap audit, not reactively

---

## 9. Hard Technical Rules

Compiled from all sessions across all three projects. These are non-negotiable.

**Next.js 16:**
- `proxy.ts` not `middleware.ts` — export named `proxy` not `middleware`
- `await params` in all dynamic routes: `const { slug } = await params`
- `export const maxDuration = 60` on upload and long-running routes
- `export const config = {}` from Pages Router does NOT work in App Router

**Supabase:**
- `getUser(token)` not `getSession()` in API routes
- `createServiceClient()` for all DB writes — anon key silently fails on RLS
- `useMemo(() => createAuthClient(), [])` in all client components
- `setAll` cookie writes are forbidden in layouts — layouts can only read
- Named export `supabase` for public queries, `createAuthClient()` for auth
- SQL changes: save migration file before running in dashboard

**CSS/UI:**
- No Tailwind — inline `<style>` tags with CSS variables only
- `BottomTabBar`: `return null` on portal paths — never `display:none`
- Portal navbar logo: always `<Link href="/">` — never `<span>` or `<div>`
- `pointer-events` interception: if a component hides with opacity/visibility, add `pointer-events: none` or use `return null`
- Mobile: `padding-bottom: 80px` on all pages where BottomTabBar is visible

**Storage:**
- Bucket must have Public toggle ON in Supabase dashboard
- Max 4MB per file through Vercel API routes (body limit)
- Path format: `[bucket]/[type]/[slug]/[timestamp]-[random].[ext]`

**Testing:**
- `npx tsc --noEmit` before every commit — zero errors
- `npm test` before every commit — all passing
- Unit tests for every pure function in `lib/`
- Never test implementation details — test behaviour

**General:**
- `is_demo=false` filter on all public listing queries
- Phone mandatory, email optional on all forms
- `NEXT_PUBLIC_SITE_URL` drives OAuth redirectTo — set per environment in Vercel
- Service role key in all API route writes
- `git pull` before every Claude Code session

---

## 10. Market Configuration

Each marketplace deployment has a `lib/vertical.ts` that configures market-specific values:

```typescript
export const VERTICAL = {
  market: 'us',                    // 'us' | 'india'
  currency: 'USD',                 // 'USD' | 'INR'
  currency_symbol: '$',            // '$' | '₹'
  phone_format: 'us',              // 'us' | 'india'
  default_state: 'WA',            // 'WA' | '' (india uses city/area)
  tiers: {
    professional: { price: 79, label: '$79/mo' },
    premium: { price: 199, label: '$199/mo' },
  },
  enquiry_verb: 'Send Quote Request',
  storage_bucket: 'fetespace-media',
  email_from: 'notifications@fetespace.com',
  support_email: 'hello@fetespace.com',
}
```

---

## 11. The Gap Audit — Fetespace Current State

See `FETESPACE_GAP_AUDIT.md` for the current state of Fetespace against this pattern.

---

_This document is the source of truth for all BISXP marketplace builds._
_It is updated when new hard lessons are learned or pattern decisions are revised._
_Every Claude Code session reads this document before writing any code._
