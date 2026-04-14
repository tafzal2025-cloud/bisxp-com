# BISXP Auth Skill — Authentication & Authorization
_Source: Fetespace R-auth-1, R-auth-2, R-auth-3 + auth debugging session 2026-04-14_
_Status: AUTHORITATIVE_
_Last updated: 2026-04-14_

---

## 1. Architecture Overview

Every BISXP marketplace uses Supabase Auth with Google OAuth as the
primary identity provider. The auth stack has three layers:

```
AuthN (identity)     Google OAuth → Supabase session → JWT
MFA (assurance)      TOTP (admin) | Email OTP (owners) | None (customers)
AuthZ (access)       role in bisxp_profiles + linked slug
```

### Persona × Auth Matrix

| Persona | OAuth | MFA | MFA Type | Code check |
|---|---|---|---|---|
| Admin | Google | Mandatory | TOTP (aal2) | verifyAdminAccess() checks aal2 |
| Venue owner | Google | New device | Email OTP | verifyOwnerAccess() checks device cookie OR aal2 |
| Vendor owner | Google | New device | Email OTP | verifyVendorAccess() checks device cookie OR aal2 |
| Customer | Google | None | — | Bearer token only |

---

## 2. The Proxy (Middleware) — Most Critical Pattern

**File: `proxy.ts` (NOT `middleware.ts` — Next.js 16 renamed it)**

This file is REQUIRED for `@supabase/ssr` to work correctly. Without
it, PKCE verifier cookies are not refreshed between requests, causing
`exchangeCodeForSession` to fail with "PKCE code verifier not found
in storage" on the first sign-in attempt.

### Correct implementation

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // CRITICAL: create ONE response object here. Never recreate it
  // inside setAll — doing so drops cookies set by previous calls.
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write to request so server components see updated cookies
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Write to the SAME response — never NextResponse.next() here
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This triggers setAll, keeping session cookies fresh
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    // CRITICAL: must cover /auth/* routes. Narrow matchers like
    // ['/owner/:path*'] break PKCE because session refresh never
    // runs during the sign-in flow.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Hard-won lessons

**NEVER do this inside setAll:**
```typescript
// ❌ WRONG — creates new response, drops all previously set cookies
setAll(cookiesToSet) {
  cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
  supabaseResponse = NextResponse.next({ request })  // ← drops cookies
  cookiesToSet.forEach(({ name, value, options }) =>
    supabaseResponse.cookies.set(name, value, options))
}
```

**NEVER use a narrow matcher:**
```typescript
// ❌ WRONG — /auth/login and /auth/callback never get session refresh
matcher: ['/owner/:path*', '/my/:path*', '/vendor/:path*']
```

**DO NOT add auth config to createBrowserClient:**
```typescript
// ❌ WRONG — flowType: 'pkce' is hardcoded in @supabase/ssr
// cookieOptions are already set correctly by default
// These options are no-ops and add confusion
export function createAuthClient() {
  return createBrowserClient(url, key, {
    cookieOptions: { name: 'sb', lifetime: 60 * 60 * 24 * 7 },
    auth: { flowType: 'pkce', storageKey: 'sb-auth' },
  })
}

// ✅ CORRECT — createBrowserClient defaults are already correct
export function createAuthClient() {
  return createBrowserClient(url, key)
}
```

---

## 3. Supabase Client Patterns

### lib/supabase.ts (browser clients)

```typescript
import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// For 'use client' components — auth + public queries
export function createAuthClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// For API routes — bypasses RLS, service role only
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

### lib/supabase-server.ts (server components + route handlers)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch {
            // Safe to ignore in Server Components (read-only context)
            // In Route Handlers this succeeds
          }
        },
      },
    }
  )
}
```

---

## 4. Auth Callback Route

```typescript
// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/my/account'

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('bisxp_profiles')
          .select('role, linked_listing_slug, linked_vendor_slug')
          .eq('id', user.id)
          .single()

        // Role-based redirect — role ALWAYS wins over redirect param
        if (profile?.role === 'admin') {
          // Check MFA assurance level
          const { data: aal } = await supabase.auth.mfa
            .getAuthenticatorAssuranceLevel()
          if (aal?.currentLevel !== 'aal2') {
            // Redirect to MFA challenge before granting admin access
            return NextResponse.redirect(
              new URL('/auth/mfa?redirect=/dashboard', origin)
            )
          }
          return NextResponse.redirect(new URL('/dashboard', origin))
        }

        if (profile?.role === 'owner' && profile?.linked_listing_slug) {
          return NextResponse.redirect(
            new URL(`/owner/${profile.linked_listing_slug}`, origin)
          )
        }

        if (profile?.role === 'vendor' && profile?.linked_vendor_slug) {
          return NextResponse.redirect(
            new URL(`/vendor/${profile.linked_vendor_slug}`, origin)
          )
        }
      }

      return NextResponse.redirect(new URL(redirect, origin))
    }
  }

  // Pass actual error message through for debugging
  const errorMsg = 'auth_failed'
  console.error('[auth/callback] auth failed')
  return NextResponse.redirect(
    new URL(`/auth/login?error=${errorMsg}`, origin)
  )
}
```

**Key rule: role check always wins over the `redirect` param.**
Admins must go to `/dashboard`, owners to their portal.
The `redirect` param is only for unauthenticated → re-auth flows.

---

## 5. API Auth Helpers (lib/api-auth.ts)

### verifyAdminAccess — checks Bearer token + role='admin' + aal2 MFA

```typescript
export async function verifyAdminAccess(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null

  const supabase = createServiceClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null

  const { data: profile } = await supabase
    .from('bisxp_profiles')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') return null

  // Enforce MFA — admin must have completed TOTP (aal2)
  const { data: aal } = await supabase.auth.mfa
    .getAuthenticatorAssuranceLevel()
  if (aal?.currentLevel !== 'aal2') return null

  return { user, profile }
}
```

### verifyOwnerAccess — checks Bearer token + role='owner' OR admin

```typescript
export async function verifyOwnerAccess(req: NextRequest, slug: string) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null

  const supabase = createServiceClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null

  const { data: profile } = await supabase
    .from('bisxp_profiles')
    .select('id, role, linked_listing_slug')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  // Admin can access any portal
  if (profile.role === 'admin') return { user, profile }

  // Owner can only access their own listing
  if (profile.role === 'owner' && profile.linked_listing_slug === slug) {
    return { user, profile }
  }

  return null
}
```

### verifyVendorAccess — same pattern for vendors

```typescript
export async function verifyVendorAccess(req: NextRequest, slug: string) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null

  const supabase = createServiceClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null

  const { data: profile } = await supabase
    .from('bisxp_profiles')
    .select('id, role, linked_vendor_slug')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  if (profile.role === 'admin') return { user, profile }

  if (profile.role === 'vendor' && profile.linked_vendor_slug === slug) {
    return { user, profile }
  }

  return null
}
```

---

## 6. Admin TOTP MFA Flow (R-auth-2)

### Supabase dashboard setup (one-time)
1. Supabase → Authentication → Multi-Factor Auth → Enable TOTP
2. Set "Enroll factors" policy to allow users to enroll

### Admin TOTP enrollment flow
```
Admin signs in with Google (aal1)
→ callback detects role=admin + aal1
→ redirect to /auth/mfa
→ if no TOTP enrolled: show QR code (enroll)
→ if TOTP enrolled: show 6-digit input (challenge)
→ on success: aal2 granted, redirect to /dashboard
```

### /auth/mfa page pattern
```typescript
// Challenge existing TOTP factor
const { data: factors } = await supabase.auth.mfa.listFactors()
const totp = factors?.totp[0]

if (!totp) {
  // Enrollment: show QR code
  const { data } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
  // data.totp.qr_code — render as <img>
} else {
  // Challenge: prompt for 6-digit code
  const { data: challenge } = await supabase.auth.mfa.challenge({
    factorId: totp.id
  })
  // User enters code, then:
  await supabase.auth.mfa.verify({
    factorId: totp.id,
    challengeId: challenge.id,
    code: userEnteredCode,
  })
  // On success: session upgrades to aal2
}
```

---

## 7. Owner Email OTP Flow (R-auth-3)

### Concept
After Google OAuth succeeds for `role=owner/vendor`, check for a
`device_trusted` cookie. If absent, trigger Supabase email OTP
and redirect to `/auth/otp`. On success, set the cookie for 30 days.

### Device trust cookie
```typescript
// Set after successful OTP verification
response.cookies.set('device_trusted', userId, {
  maxAge: 60 * 60 * 24 * 30, // 30 days
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
})
```

### Callback check for owners
```typescript
if (profile?.role === 'owner' || profile?.role === 'vendor') {
  const deviceTrusted = request.cookies.get('device_trusted')
  if (deviceTrusted?.value !== user.id) {
    // New device — require email OTP
    await supabase.auth.signInWithOtp({ email: user.email })
    return NextResponse.redirect(
      new URL(`/auth/otp?redirect=${portalUrl}`, origin)
    )
  }
  // Trusted device — go straight to portal
}
```

---

## 8. Profile Roles Reference

```sql
-- bisxp_profiles role constraint
role text NOT NULL DEFAULT 'customer'
  CHECK (role IN ('customer', 'owner', 'vendor', 'admin'))
```

| Role | Access |
|---|---|
| customer | /my/account, own enquiries |
| owner | /owner/[linked_listing_slug] only |
| vendor | /vendor/[linked_vendor_slug] only |
| admin | /dashboard + all owner/vendor portals |

### Setting admin role (one-time SQL)
```sql
UPDATE bisxp_profiles
SET role = 'admin'
WHERE id = '<your-auth-user-uuid>';
```

### Linking an owner to their listing (admin UI or SQL)
```sql
UPDATE bisxp_profiles
SET role = 'owner', linked_listing_slug = 'liljebeck-farms'
WHERE id = '<owner-auth-user-uuid>';
```

---

## 9. Navbar Auth Pattern

Every page with a navbar must:
1. Check session on mount via `supabase.auth.getSession()`
2. Show avatar with initials when signed in
3. Avatar click opens dropdown:
   - My Account → /my/account (all users)
   - Dashboard → /dashboard (admin only)
   - [Portal name] → /owner/[slug] or /vendor/[slug] (owners/vendors)
   - Sign Out → supabase.auth.signOut() + window.location.href='/'
4. Show Sign In button when signed out

### Avatar dropdown pattern
```typescript
const [showDropdown, setShowDropdown] = useState(false)
const dropdownRef = useRef<HTMLDivElement>(null)

// Close on outside click
useEffect(() => {
  function handleClick(e: MouseEvent) {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setShowDropdown(false)
    }
  }
  document.addEventListener('mousedown', handleClick)
  return () => document.removeEventListener('mousedown', handleClick)
}, [])
```

---

## 10. Environment Variables Required

```bash
# All BISXP projects
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Site URL — must match actual domain per environment
# Production: https://fetespace.com
# Preview: https://preview.fetespace.com
# Development: http://localhost:3030
NEXT_PUBLIC_SITE_URL=https://fetespace.com

# Supabase dashboard must also have:
# Authentication → URL Configuration → Site URL = production URL
# Authentication → URL Configuration → Redirect URLs:
#   https://fetespace.com/auth/callback
#   https://preview.fetespace.com/auth/callback
#   http://localhost:3030/auth/callback
```

---

## 11. Common Mistakes Reference

| Mistake | Symptom | Fix |
|---|---|---|
| `proxy.ts` matcher too narrow | PKCE verifier cookie disappears, first sign-in fails | Broaden matcher to all non-static paths |
| `setAll` recreates response | Cookie flashes then vanishes | Never call `NextResponse.next()` inside `setAll` |
| Adding `flowType: 'pkce'` to browser client | No effect, just confusing | Remove — it's hardcoded in `@supabase/ssr` |
| `verifyAdminAccess` doesn't check `aal2` | Admin accessible without MFA | Add `getAuthenticatorAssuranceLevel()` check |
| Role check after redirect param | Admin lands on `/my/account` | Role check must always win over redirect param |
| `setAll` try/catch swallows real errors | Silent cookie write failures | Log errors in development |
| Admin email = personal Gmail | Full platform exposed if compromised | Use dedicated `admin@<domain>.com` before launch |
| Shared admin PIN across projects | One breach = all projects exposed | Role-based auth (R-auth-1 closed this) |

---

## 12. Pre-Launch Auth Checklist

- [ ] Admin has TOTP enrolled and verified on /dashboard
- [ ] `verifyAdminAccess` checks `aal2`
- [ ] Admin email is dedicated (not personal Gmail)
- [ ] `proxy.ts` uses broad matcher + correct `setAll`
- [ ] `NEXT_PUBLIC_SITE_URL` set correctly in Vercel per environment
- [ ] Supabase redirect URL allowlist includes all environments
- [ ] `bisxp_profiles` has `role='admin'` for admin user
- [ ] No `DASHBOARD_PIN` remaining in code (R-auth-1 removed it)
- [ ] Owner email OTP enabled for new devices (R-auth-3)
- [ ] Customer auth: Google OAuth only, no MFA friction
