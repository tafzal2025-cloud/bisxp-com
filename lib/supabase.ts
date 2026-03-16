'use client'

import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function createAuthClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Server-side helper — use in API routes and server components
// Import and call this inline in each API route:
// import { createServerClient } from '@supabase/ssr'
// const cookieStore = await cookies()
// const supabase = createServerClient(url, key, { cookies: { getAll, setAll } })
// Always use supabase.auth.getUser() — never getSession()

// Service role client — use for admin ops and RLS bypass
// import { createClient } from '@supabase/supabase-js'
// const serviceClient = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!)
