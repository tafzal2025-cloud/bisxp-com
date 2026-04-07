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

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })) }
  }))
}))

// Mock @supabase/supabase-js
const mockInsert = vi.fn()
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: () => ({
      insert: (data: unknown) => {
        mockInsert(data)
        return {
          select: () => ({
            single: () => Promise.resolve({
              data: { id: 'test-uuid-123', ...((data as Record<string, unknown>[])?.[0] ?? data) },
              error: null
            })
          })
        }
      }
    })
  }))
}))

// Mock resend
const mockSend = vi.fn(() => Promise.resolve({ data: { id: 'email-123' }, error: null }))
vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: { send: mockSend }
  }))
}))

// Stub env
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')
vi.stubEnv('RESEND_API_KEY', 'test-resend-key')
vi.stubEnv('RESEND_FROM_EMAIL', 'test@bisxp.com')
vi.stubEnv('ADMIN_EMAIL', 'admin@bisxp.com')

import { POST } from '@/app/api/enquiry/route'
import { NextRequest } from 'next/server'

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/enquiry', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

describe('POST /api/enquiry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when name is missing', async () => {
    const res = await POST(makeRequest({ email: 'test@example.com', message: 'A valid message that is long enough to pass validation.' }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('Name')
  })

  it('returns 400 when email is invalid', async () => {
    const res = await POST(makeRequest({ name: 'Test', email: 'not-an-email', message: 'A valid message that is long enough to pass validation.' }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('email')
  })

  it('returns 400 when message is too short', async () => {
    const res = await POST(makeRequest({ name: 'Test', email: 'test@example.com', message: 'Short msg' }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('20 characters')
  })

  it('returns 200 with valid data', async () => {
    const res = await POST(makeRequest({
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a valid test message that exceeds twenty characters.'
    }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.id).toBeDefined()
  })

  it('returns 200 even when Resend throws', async () => {
    mockSend.mockRejectedValueOnce(new Error('Resend API down'))
    const res = await POST(makeRequest({
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a valid test message that exceeds twenty characters.'
    }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
  })
})
