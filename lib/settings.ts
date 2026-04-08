import { createClient } from '@supabase/supabase-js'

export type Settings = Record<string, string>

export async function getSettings(): Promise<Settings> {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data, error } = await db
    .from('bisxp_settings')
    .select('key, value')
  if (error || !data) return {}
  return Object.fromEntries(data.map(r => [r.key, r.value]))
}
