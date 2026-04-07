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
const mockGetUser = vi.fn()
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({
    getAll: () => [],
    set: vi.fn()
  }))
}))

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser }
  }))
}))

// Mock @supabase/supabase-js
const mockUpdate = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: () => ({
      update: (data: unknown) => {
        mockUpdate(data)
        return {
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({
                data: { id: 'test-uuid', status: (data as Record<string, string>).status },
                error: null
              })
            })
          })
        }
      }
    })
  }))
}))

// Stub env
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')

import { PATCH } from '@/app/api/enquiry/[id]/route'
import { NextRequest } from 'next/server'

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/enquiry/test-id', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

const params = Promise.resolve({ id: 'test-uuid' })

describe('PATCH /api/enquiry/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'No session' } })
    const res = await PATCH(makeRequest({ status: 'contacted' }), { params })
    expect(res.status).toBe(401)
  })

  it('returns 200 with valid status update', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null })
    const res = await PATCH(makeRequest({ status: 'contacted' }), { params })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it('returns 400 with invalid status value', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null })
    const res = await PATCH(makeRequest({ status: 'invalid_status' }), { params })
    expect(res.status).toBe(400)
  })
})
