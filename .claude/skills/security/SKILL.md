# SKILL: Security
_For: All BISXP marketplace projects (Fetespace, TABRO.IN, Starlight Meadows)_
_Read this before building any API route, auth flow, or input handler_
_Status: AUTHORITATIVE_
_Source project: Fetespace — Security R-session R5_
_Source session: R5 — 2026-04-11_
_Last updated: 2026-04-11_

---

## The threat model

BISXP marketplaces have six attack surfaces. Every feature touches
at least one. Read the relevant section before building.

1. **Authentication** — who can access admin and owner portals
2. **Authorization** — can owner A access owner B's data
3. **Input validation** — what users submit through forms and APIs
4. **Data exposure** — what the API returns that it shouldn't
5. **Infrastructure** — HTTP headers, rate limiting, robots
6. **Dependency surface** — Supabase key scope, third-party embeds

Open findings per category are tracked in `SECURITY-AUDIT-NOTES.md`.
This skill covers the implementation patterns to fix them.

---

## 1. Authentication

### API route auth — always use getUser(), never getSession()

```typescript
// CORRECT — verifies token server-side with Supabase Auth
const { data: { user } } = await supabase.auth.getUser(token)
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// WRONG — getSession() reads from cookie/local state, can be spoofed
const { data: { session } } = await supabase.auth.getSession()
```

### Admin PIN — rate limiting (R5 Fetespace pattern)

```typescript
// app/api/admin/*/route.ts — rate limit BEFORE PIN check (fail fast)
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

function rateLimit(req: NextRequest): NextResponse | null {
  const ip = getClientIp(req)
  const rl = checkRateLimit(`admin:${ip}`, 10, 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 60) } }
    )
  }
  return null
}

export async function GET(req: NextRequest) {
  const limited = rateLimit(req)
  if (limited) return limited
  if (!checkPin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // ... handler
}
```

**Constant-time PIN comparison** is tracked as AUTH-CTC and is **not
yet shipped** in Fetespace. When adding: use `crypto.timingSafeEqual`
with equal-length buffers.

### Bearer token auth — use lib/api-auth.ts

Always import from the shared lib. Never inline auth logic in routes.

```typescript
import { verifyOwnerAccess } from '@/lib/api-auth'
// verifyOwnerAccess checks: token valid, user linked to slug, admin bypass
```

See `Skills/api-routes.md` for the complete auth pattern.

---

## 2. Authorization

### Never trust client-supplied identity

```typescript
// WRONG — client tells us who they are
const { userId } = await req.json()
const data = await supabase.from('enquiries').select().eq('user_id', userId)

// CORRECT — server derives identity from verified token
const { data: { user } } = await supabase.auth.getUser(token)
const data = await supabase.from('enquiries').select().eq('user_id', user.id)
```

### Explicit column SELECT — never select('*') on sensitive tables

```typescript
// WRONG — returns owner_email, owner_phone, internal fields to public
const { data } = await supabase.from('bisxp_listings').select('*')

// CORRECT — explicit list, no sensitive fields
const { data } = await supabase.from('bisxp_listings').select(
  'id, name, slug, category, city, state, short_description, ' +
  'description, photos, videos, tier, claimed, rating, review_count, ' +
  'price_from, capacity, amenities, event_types, hero_gradient, ' +
  'hero_photo, website, featured, badge'
  // NOT: owner_email, owner_phone, owner_name — portal only
)
```

### RLS — all marketplace tables must have RLS enabled

```sql
-- Check RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Enable RLS on any table missing it
ALTER TABLE bisxp_enquiries ENABLE ROW LEVEL SECURITY;

-- Public SELECT policy (listings visible to all)
CREATE POLICY "Public listings are viewable"
ON bisxp_listings FOR SELECT
USING (is_active = true AND is_demo = false);

-- Enquiries only visible to owner (via service role in API)
-- No public SELECT policy on bisxp_enquiries
```

### Cross-owner test coverage — required for every portal route

Every owner/vendor API route must have an integration test:
```typescript
it('owner A cannot access owner B listing', async () => {
  // ownerA token + ownerB slug → 403
  const res = await fetch(`/api/owner/${ownerBSlug}`, {
    headers: { Authorization: `Bearer ${ownerAToken}` }
  })
  expect(res.status).toBe(403)
})
```

---

## 3. Input validation

### Rate limiting — all public mutation endpoints

Apply to any endpoint that creates data (enquiries, reviews, claims):

```typescript
// Simple in-memory rate limiter (use Vercel KV in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(
  ip: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const key = ip
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true }
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.resetAt - now) / 1000)
    }
  }

  record.count++
  return { allowed: true }
}

// Usage in API route:
const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
const { allowed, retryAfter } = checkRateLimit(ip, 5, 60 * 60 * 1000)
if (!allowed) {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfter) }
    }
  )
}
```

**Rate limits per endpoint:**
| Endpoint | Limit | Window |
|---|---|---|
| /api/enquiry | 5 requests | per IP per hour |
| /api/reviews | 3 requests | per IP per 24 hours |
| /api/claim | 3 requests | per IP per hour |
| /api/admin/* | 10 requests | per IP per minute |

### Field length limits — all text inputs

```typescript
// In every API route that accepts user text:
const MAX_LENGTHS = {
  name:    100,
  email:   254,  // RFC 5321
  phone:   20,
  message: 2000,
  title:   200,
  body:    5000,
}

function validateLengths(
  fields: Record<string, string | undefined>
): string | null {
  for (const [key, value] of Object.entries(fields)) {
    if (value && value.length > (MAX_LENGTHS[key as keyof typeof MAX_LENGTHS] ?? 500)) {
      return `${key} is too long (max ${MAX_LENGTHS[key as keyof typeof MAX_LENGTHS]} characters)`
    }
  }
  return null
}

// Usage:
const error = validateLengths({ name, email, message })
if (error) return NextResponse.json({ error }, { status: 400 })
```

### File type validation — server-side allowlist

See `Skills/file-upload.md` for the complete implementation.
Never derive file extension from the filename — always from the
validated MIME type.

### Video URL validation — parseVideoEmbed()

See `Skills/video-embed.md` for the complete implementation.
Server validates independently of client. Raw URL never reaches DOM.

### Enquiry deduplication

```typescript
// Prevent spam — reject duplicate enquiries within 24 hours
const { data: existing } = await supabase
  .from('bisxp_enquiries')
  .select('id')
  .eq('listing_slug', slug)
  .eq('phone', phone)
  .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  .limit(1)
  .single()

if (existing) {
  return NextResponse.json(
    { error: 'An enquiry from this number was already submitted recently.' },
    { status: 429 }
  )
}
```

---

## 4. Data exposure

### Service role key — server-only, never client

```typescript
// CORRECT — service role only in API routes
import { createServiceClient } from '@/lib/supabase'
// createServiceClient() uses SUPABASE_SERVICE_ROLE_KEY (server-only env var)

// WRONG — never use service role in client components
// NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY does not exist
// and must never be created
```

**Audit check:**
```bash
grep -rn "SERVICE_ROLE" app/ --include="*.tsx" --include="*.ts"
# Must return zero results
```

### Sensitive fields — never return in public API responses

Fields that must never appear in public listing/vendor API responses:
- `owner_email` — available in owner portal only
- `owner_phone` — available in owner portal only
- `owner_name` — available in admin dashboard only
- `notes` — internal admin field on enquiries
- `closure_reason` — internal admin field

---

## 5. Infrastructure

### Security headers — add to next.config.ts

```typescript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      // Required for YouTube/Vimeo embeds:
      "frame-src https://www.youtube.com https://player.vimeo.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "font-src 'self' https://fonts.gstatic.com",
    ].join('; ')
  },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

**Important:** `frame-src` must include `youtube.com` and
`vimeo.com` — without these the video embed iframes will be
blocked by the CSP.

### robots.txt — disallow admin and portal routes

```
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /owner/
Disallow: /vendor/
Disallow: /my/
Disallow: /auth/

Sitemap: https://fetespace.com/sitemap.xml
```

---

## 6. Dependency surface

### Supabase key usage rules

| Key | Where used | Accessible to client? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Everywhere | Yes — safe |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | Yes — safe, RLS enforced |
| `SUPABASE_SERVICE_ROLE_KEY` | API routes only | No — bypasses RLS |

RLS is the security boundary for the anon key.
The service role key is the master key — treat it like a password.

### Third-party embeds

YouTube and Vimeo iframes are sandboxed by the browser.
The `allow` attribute controls what the iframe can access:

```tsx
<iframe
  src={embedUrl}
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
  // sandbox="allow-scripts allow-same-origin"  // optional: adds extra restriction
/>
```

Do NOT add `allow-top-navigation` or `allow-forms` to sandbox —
these would allow the iframe to navigate the parent page.

---

## Security checklist — before shipping any feature

### API routes
- [ ] Auth verified before any data operation (`verifyOwnerAccess` / `verifyVendorAccess`)
- [ ] `getUser()` used, never `getSession()`
- [ ] Rate limiting on public mutation endpoints
- [ ] Field length limits enforced
- [ ] File types validated server-side (not just client accept=)
- [ ] `select('*')` replaced with explicit column list on public routes
- [ ] Sensitive fields excluded from public responses

### Input handling
- [ ] Text fields have max length enforced
- [ ] File MIME type validated against allowlist
- [ ] Video URLs validated via `parseVideoEmbed()` server-side
- [ ] No user input interpolated directly into SQL (use Supabase client parameterised queries)

### Infrastructure
- [ ] Security headers set in next.config.ts
- [ ] `frame-src` includes youtube.com and vimeo.com if video embeds used
- [ ] robots.txt disallows admin/portal routes
- [ ] `SUPABASE_SERVICE_ROLE_KEY` not in any client file
- [ ] `SUPABASE_SERVICE_ROLE_KEY` not in git history

### Tests
- [ ] Cross-owner access test: owner A token + owner B slug → 403
- [ ] Rate limit test: 6th request within window → 429
- [ ] Field length test: oversized input → 400
- [ ] Invalid file type test → 400

---

## Current security score baseline (post-R5)

| Category | Score | Notes |
|---|---|---|
| Authentication | 11/25 | Rate limit done; expiry/OAuth/PIN-arch open |
| Authorization | 12.5/25 | Explicit SELECT done; RLS pending dashboard run |
| Input Validation | 25/25 | Rate limit + dedup + length + MIME |
| Infrastructure | 22.5/25 | CSP + X-Frame + robots done |
| **Total** | **~75/100** | |

Target after next security pass: **85+/100** (run migration 013, close AUTH-02/03).
