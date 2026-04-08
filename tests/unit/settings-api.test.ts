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
  cookies: vi.fn(() => Promise.resolve({
    getAll: () => [],
    set: vi.fn()
  }))
}))

// Mock @supabase/ssr — auth client
const mockGetUser = vi.fn()
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser }
  }))
}))

// Mock @supabase/supabase-js — service role client
const mockSelect = vi.fn()
const mockUpdate = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: () => ({
      select: (...args: unknown[]) => {
        mockSelect(...args)
        return {
          order: () => Promise.resolve({
            data: [
              { key: 'hero_headline', value: 'We don\'t just advise.', label: 'Hero headline', section: 'hero', sort_order: 1 },
              { key: 'stat_1_number', value: '4', label: 'Stat 1 number', section: 'stats', sort_order: 1 }
            ],
            error: null
          }),
          // For getSettings() which doesn't use order
          then: (resolve: (v: unknown) => void) => resolve({
            data: [
              { key: 'hero_headline', value: 'We don\'t just advise.' },
              { key: 'stat_1_number', value: '4' }
            ],
            error: null
          })
        }
      },
      update: (data: unknown) => {
        mockUpdate(data)
        return {
          eq: () => Promise.resolve({ error: null })
        }
      }
    })
  }))
}))

// Stub env
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')

describe('GET /api/settings (public)', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 200 with settings object', async () => {
    const { GET } = await import('@/app/api/settings/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.hero_headline).toBeDefined()
  })
})

describe('GET /api/admin/settings (auth-protected)', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'No session' } })
    const { GET } = await import('@/app/api/admin/settings/route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns 200 when authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null })
    const { GET } = await import('@/app/api/admin/settings/route')
    const res = await GET()
    expect(res.status).toBe(200)
  })
})

describe('POST /api/admin/settings (auth-protected)', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'No session' } })
    const { POST } = await import('@/app/api/admin/settings/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify({ key: 'hero_headline', value: 'New value' })
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when key missing', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null })
    const { POST } = await import('@/app/api/admin/settings/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify({ value: 'something' })
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 with valid key and value', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null })
    const { POST } = await import('@/app/api/admin/settings/route')
    const { NextRequest } = await import('next/server')
    const req = new NextRequest('http://localhost/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify({ key: 'hero_headline', value: 'Updated headline' })
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.key).toBe('hero_headline')
  })
})
