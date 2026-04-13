# TECHNICAL DECISIONS
_Platform-level decisions for all BISXP marketplace projects._
_Last updated: 2026-04-11_

> Per-project ADRs live in each project repo's TECHNICAL_DECISIONS.md.
> This file contains platform-level decisions that apply to all BISXP projects.

---

## How to Use This File

Every significant architectural decision is recorded here
with the reasoning and the alternatives considered.

This prevents two failure modes:
1. Revisiting settled decisions ("why did we choose X?")
2. New contributors undermining decisions they don't know exist

Format: Decision → Options considered → Choice → Reason → Date

---

## Decision Log

---

### TD-001: Table naming convention

**Decision**: Use `bisxp_` prefix for all tables.

**Options considered**:
- A: Generic names (listings, vendors, enquiries)
- B: Project-specific names (fs_listings, fetespace_listings)
- C: BISXP platform names (bisxp_listings, bisxp_vendors) ✅

**Choice**: Option C — bisxp_ prefix

**Reason**: Every BISXP marketplace is a deployment of the BISXP platform.
Using the BISXP table naming convention means the schema is
directly portable to any other BISXP vertical. A future
partner deployment or a migration to multi-tenant BISXP Cloud
requires no schema rename. The prefix also makes it
immediately clear in the DB which tables belong to the
platform layer vs any vertical-specific additions.

**Date**: 2026-04-09

---

### TD-002: No Tailwind CSS

**Decision**: Inline style tags with CSS variables only.
No Tailwind. No CSS modules. No styled-components.

**Options considered**:
- A: Tailwind CSS (utility-first)
- B: CSS Modules
- C: Inline styles with CSS variables ✅
- D: Styled-components

**Choice**: Option C — inline styles with CSS variables

**Reason**: Consistent with all other BISXP platform projects.
The CSS variable approach means brand tokens are defined once
and referenced everywhere — a brand color change is a
one-line edit in the CSS variable definition, not a
global find-and-replace. Tailwind generates large CSS bundles
and makes brand customisation harder for partners who
white-label the platform. The inline approach also means
every page is self-contained — there is no global stylesheet
that can cause unexpected cascades.

**Date**: 2026-04-09

---

### TD-003: Video upload via presigned URLs

**Decision**: All video uploads use a 3-step presigned
URL flow rather than multipart through API routes.

**Options considered**:
- A: Multipart upload through Vercel API route
- B: Presigned URL — browser uploads directly to Supabase ✅
- C: Third-party upload service (Uploadcare, Cloudinary)

**Choice**: Option B — presigned URL flow

**Reason**: Vercel Hobby plan has a hard 4.5MB request body
limit. Videos are frequently 10–200MB. Option A fails
silently with a 413 Content Too Large error. Option C
adds cost and a third-party dependency. The presigned URL
pattern is: (1) API route asks Supabase for a signed upload
URL, (2) browser PUTs the file directly to Supabase Storage
bypassing Vercel entirely, (3) API route confirms the public
URL is saved to the DB. This was learned the hard way on
Starlight Meadows and TABRO.IN.

**Date**: 2026-04-09

---

### TD-005: Single vertical config file (lib/vertical.ts)

**Decision**: All vertical-specific values live in one file.
Nothing else in the codebase is changed per deployment.

**Options considered**:
- A: Environment variables for all vertical config
- B: Supabase settings table for all vertical config
- C: Single TypeScript config file ✅
- D: Split across multiple files by concern

**Choice**: Option C — single lib/vertical.ts

**Reason**: Environment variables (Option A) are for secrets
and infrastructure, not business logic. Having 50+ env vars
for category names would be unmanageable. Supabase settings
(Option B) requires a network call to read config at every
page load, adding latency and a failure point. The TypeScript
file (Option C) is type-safe, tree-shaken at build time,
zero latency, and makes the full vertical configuration
visible in one place. A partner deploying a new vertical
opens one file and changes the values — no other file
in the codebase needs touching.

**Date**: 2026-04-09

---

### TD-006: Next.js 16 App Router only

**Decision**: Use Next.js 16 App Router exclusively.
No Pages Router. No hybrid.

**Options considered**:
- A: Pages Router (Next.js 12–14 style)
- B: App Router (Next.js 13+ style) ✅
- C: Hybrid (some pages on each)

**Choice**: Option B — App Router exclusively

**Reason**: Consistent with all BISXP platform projects.
App Router enables React Server Components, streaming,
and nested layouts — all of which improve performance
for a marketplace with many listing pages. The Pages Router
is in maintenance mode. Option C (hybrid) creates cognitive
overhead and routing inconsistencies. One router, one mental
model, consistent patterns across all pages.

**Date**: 2026-04-09

---

### TD-007: Supabase over PlanetScale / Neon / Railway

**Decision**: Supabase for database, auth, and storage.

**Options considered**:
- A: PlanetScale (DB) + Clerk (auth) + S3 (storage)
- B: Neon (DB) + NextAuth (auth) + Cloudflare R2 (storage)
- C: Supabase (DB + auth + storage + realtime) ✅

**Choice**: Option C — Supabase all-in-one

**Reason**: Three services replaced by one. Supabase provides
Postgres (the most capable open-source DB), built-in auth
with OAuth providers, S3-compatible storage, realtime
subscriptions, and Row Level Security — all with a generous
free tier and a clear upgrade path. The BISXP platform has
proven this stack across four live deployments. The
operational simplicity of one vendor for DB + auth + storage
outweighs any marginal capability advantage from combining
best-of-breed services.

**Date**: 2026-04-09
