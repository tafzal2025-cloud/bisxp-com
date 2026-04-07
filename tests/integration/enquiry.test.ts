import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const SKIP = !process.env.SUPABASE_TEST_URL

describe('POST /api/enquiry — integration', () => {
  it.skipIf(SKIP)('saves enquiry to database', async () => {
    const testEmail = `test-${Date.now()}@bisxp-integration-test.com`

    const res = await fetch('http://localhost:3000/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Integration Test User',
        email: testEmail,
        message: 'This is an integration test message with enough characters'
      })
    })

    expect(res.status).toBe(200)

    // Verify in DB
    const db = createClient(
      process.env.SUPABASE_TEST_URL!,
      process.env.SUPABASE_TEST_SERVICE_ROLE_KEY!
    )
    const { data } = await db
      .from('enquiries')
      .select('*')
      .eq('email', testEmail)
      .single()

    expect(data).toBeTruthy()
    expect(data.name).toBe('Integration Test User')

    // Cleanup
    await db.from('enquiries').delete().eq('email', testEmail)
  })
})
