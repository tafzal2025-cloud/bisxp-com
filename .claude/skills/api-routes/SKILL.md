# Skill: API Routes — BISXP.com
_Apply when creating or modifying API routes in `app/api/`._

---

## Thin route pattern (< 80 lines)

```typescript
// app/api/feature/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60  // always include

export async function POST(request: NextRequest) {
  // 1. Auth check (for protected routes)
  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (list) => list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Parse + validate
  const body = await request.json()
  const { name, email, message } = body
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  // 3. DB operation (service role bypasses RLS)
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data, error } = await db.from('table').insert({ name, email, message }).select().single()
  if (error) return NextResponse.json({ error: 'Failed to save' }, { status: 500 })

  // 4. Return
  return NextResponse.json({ success: true, id: data.id })
}
```

---

## Dynamic route params (Next.js 16)
```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  // always await
  // ...
}
```

---

## TDD template for API routes
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')
vi.stubEnv('RESEND_API_KEY', 'test-resend-key')
vi.stubEnv('ADMIN_EMAIL', 'admin@bisxp.com')

const mockInsert = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      insert: mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null })
        })
      })
    })
  })
}))

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn().mockResolvedValue({ id: 'email-id' }) }
  }))
}))

describe('POST /api/enquiry', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 400 when name missing', async () => {
    const req = new Request('http://localhost/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', message: 'A'.repeat(25) })
    })
    const { POST } = await import('@/app/api/enquiry/route')
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('Name')
  })

  it('returns 400 when email invalid', async () => {
    const req = new Request('http://localhost/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'notanemail', message: 'A'.repeat(25) })
    })
    const { POST } = await import('@/app/api/enquiry/route')
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when message too short', async () => {
    const req = new Request('http://localhost/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'test@test.com', message: 'short' })
    })
    const { POST } = await import('@/app/api/enquiry/route')
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 with valid data', async () => {
    const req = new Request('http://localhost/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: 'test@test.com', message: 'A'.repeat(25) })
    })
    const { POST } = await import('@/app/api/enquiry/route')
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  it('saves to database even if email fails', async () => {
    // Mock Resend to throw
    vi.mocked(require('resend').Resend).mockImplementation(() => ({
      emails: { send: vi.fn().mockRejectedValue(new Error('Email failed')) }
    }))
    const req = new Request('http://localhost/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: 'test@test.com', message: 'A'.repeat(25) })
    })
    const { POST } = await import('@/app/api/enquiry/route')
    const res = await POST(req)
    // Still 200 — email failure doesn't fail the request
    expect(res.status).toBe(200)
    expect(mockInsert).toHaveBeenCalled()
  })
})
```

---

## Never-do list
1. Never `getSession()` — always `getUser()`
2. Never return raw Supabase error messages to client
3. Never use `export const config = {}` — Pages Router pattern, breaks App Router
4. Never forget `export const maxDuration = 60`
5. Never commit service role key
6. Never create routes > 80 lines — extract to `lib/`
7. Never let email failure fail the user request — wrap in try/catch
