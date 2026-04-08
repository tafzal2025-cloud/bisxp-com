import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser } from '@/lib/admin-auth'

export const maxDuration = 60

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  const { id } = await params
  const body = await request.json()
  body.updated_at = new Date().toISOString()
  const { data, error } = await db().from('bisxp_research_cards').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: 'Failed to update.' }, { status: 500 })
  return NextResponse.json({ success: true, data })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  const { id } = await params
  const { error } = await db().from('bisxp_research_cards').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete.' }, { status: 500 })
  return NextResponse.json({ success: true })
}
