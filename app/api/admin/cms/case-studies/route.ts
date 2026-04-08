import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser } from '@/lib/admin-auth'

export const maxDuration = 60

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  const { data, error } = await db().from('bisxp_case_studies').select('*').order('sort_order')
  if (error) return NextResponse.json({ error: 'Failed to fetch.' }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  const body = await request.json()
  const { data, error } = await db().from('bisxp_case_studies').insert(body).select().single()
  if (error) return NextResponse.json({ error: 'Failed to create.' }, { status: 500 })
  return NextResponse.json({ success: true, data })
}
