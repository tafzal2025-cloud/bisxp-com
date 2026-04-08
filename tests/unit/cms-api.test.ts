import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/server
vi.mock('next/server', () => ({
  NextRequest: class {
    constructor(public url: string, public init?: RequestInit) {}
    async json() { return JSON.parse(this.init?.body as string || '{}') }
  },
  NextResponse: {
    json: (body: unknown, opts?: { status?: number }) => ({
      status: opts?.status ?? 200,
      body,
      async json() { return body }
    })
  }
}))

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({ getAll: () => [], set: vi.fn() }))
}))

// Mock admin-auth
const mockGetAuthUser = vi.fn()
vi.mock('@/lib/admin-auth', () => ({
  getAuthUser: () => mockGetAuthUser()
}))

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })) }
  }))
}))

// Mock @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: () => ({
      select: () => ({
        order: () => ({
          eq: () => Promise.resolve({ data: [{ id: '1', title: 'Test' }], error: null }),
          then: (r: (v: unknown) => void) => r({ data: [{ id: '1', title: 'Test', is_visible: true }], error: null })
        }),
        eq: () => Promise.resolve({ data: [{ id: '1', title: 'Test', is_visible: true }], error: null }),
        then: (r: (v: unknown) => void) => r({ data: [{ id: '1', title: 'Test' }], error: null })
      }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 'new-1', title: 'New' }, error: null }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: '1', title: 'Updated' }, error: null }) }) }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    })
  }))
}))

vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')

describe('CMS Public Routes', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('GET /api/cms/case-studies returns 200', async () => {
    const { GET } = await import('@/app/api/cms/case-studies/route')
    const res = await GET()
    expect(res.status).toBe(200)
  })

  it('GET /api/cms/services returns 200', async () => {
    const { GET } = await import('@/app/api/cms/services/route')
    const res = await GET()
    expect(res.status).toBe(200)
  })
})

describe('CMS Admin Routes', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('GET /api/admin/cms/case-studies returns 401 unauth', async () => {
    mockGetAuthUser.mockResolvedValueOnce(null)
    const { GET } = await import('@/app/api/admin/cms/case-studies/route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('GET /api/admin/cms/case-studies returns 200 auth', async () => {
    mockGetAuthUser.mockResolvedValueOnce({ id: 'user-1' })
    const { GET } = await import('@/app/api/admin/cms/case-studies/route')
    const res = await GET()
    expect(res.status).toBe(200)
  })

  it('POST /api/admin/cms/case-studies returns 401 unauth', async () => {
    mockGetAuthUser.mockResolvedValueOnce(null)
    const { POST } = await import('@/app/api/admin/cms/case-studies/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({ title: 'Test' }) })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('POST /api/admin/cms/case-studies returns 200 auth', async () => {
    mockGetAuthUser.mockResolvedValueOnce({ id: 'user-1' })
    const { POST } = await import('@/app/api/admin/cms/case-studies/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost', { method: 'POST', body: JSON.stringify({ title: 'New Study' }) })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it('PATCH /api/admin/cms/case-studies/[id] returns 401 unauth', async () => {
    mockGetAuthUser.mockResolvedValueOnce(null)
    const { PATCH } = await import('@/app/api/admin/cms/case-studies/[id]/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost', { method: 'PATCH', body: JSON.stringify({ title: 'Updated' }) })
    const res = await PATCH(req, { params: Promise.resolve({ id: 'test-id' }) })
    expect(res.status).toBe(401)
  })

  it('DELETE /api/admin/cms/case-studies/[id] returns 200 auth', async () => {
    mockGetAuthUser.mockResolvedValueOnce({ id: 'user-1' })
    const { DELETE: DEL } = await import('@/app/api/admin/cms/case-studies/[id]/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost', { method: 'DELETE' })
    const res = await DEL(req, { params: Promise.resolve({ id: 'test-id' }) })
    expect(res.status).toBe(200)
  })
})
