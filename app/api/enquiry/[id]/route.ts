import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

const VALID_STATUSES = ['new', 'contacted', 'qualified', 'converted', 'closed'] as const

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Auth check — use server client
    const cookieStore = await cookies()
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await request.json()
    const { status, notes } = body

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 })
    }

    const updatePayload: Record<string, string> = {}
    if (status) updatePayload.status = status
    if (notes !== undefined) updatePayload.notes = notes

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No fields to update.' }, { status: 400 })
    }

    // Service role client — bypasses RLS
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await serviceClient
      .from('enquiries')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('DB update error:', error)
      return NextResponse.json({ error: 'Failed to update enquiry.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, enquiry: data })
  } catch (err) {
    console.error('PATCH /api/enquiry/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
