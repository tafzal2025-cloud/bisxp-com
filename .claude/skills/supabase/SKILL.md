# Skill: Supabase Patterns — BISXP.com
_Apply when working with Supabase in any bisxp-com file._

---

## Four Supabase clients

### 1. Browser client (public, no auth needed)
```typescript
import { supabase } from '@/lib/supabase'
// Use for: public reads where RLS allows anonymous access
```

### 2. Auth-dependent client (client components)
```typescript
import { createAuthClient } from '@/lib/supabase'
// ALWAYS wrap in useMemo() — never outside useMemo
const supabase = useMemo(() => createAuthClient(), [])
// Use for: auth state, user-specific queries
```

### 3. Server component client (API routes, server components)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const cookieStore = await cookies()
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(list) {
        list.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options))
      }
    }
  }
)
// Always getUser() — never getSession()
const { data: { user } } = await supabase.auth.getUser()
```

### 4. Service role client (RLS bypass — server only)
```typescript
import { createClient } from '@supabase/supabase-js'
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
// Use for: all DB writes (enquiry insert, status update)
// NEVER use on the client — grants full database access
```

---

## Auth rule — non-negotiable
```typescript
// CORRECT — server-verified, cannot be spoofed
const { data: { user } } = await supabase.auth.getUser()

// WRONG — reads local storage, can be spoofed
const { data: { session } } = await supabase.auth.getSession()
```

---

## Migration template
```sql
-- Migration NNN: description
-- Date: YYYY-MM-DD | Session: N
-- Run in Supabase SQL Editor. Do NOT run again.

CREATE TABLE IF NOT EXISTS table_name (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'active')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_table_status ON table_name (status);
CREATE INDEX IF NOT EXISTS idx_table_created ON table_name (created_at DESC);

ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert" ON table_name FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin select" ON table_name FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin update" ON table_name FOR UPDATE USING (auth.role() = 'authenticated');
```

---

## Schema rules
1. Only ADD columns — never DROP, RENAME, or ALTER TYPE
2. New columns: nullable or with DEFAULT (never NOT NULL without default on existing tables)
3. All PKs: `uuid DEFAULT gen_random_uuid()`
4. All timestamps: `timestamptz DEFAULT now()`
5. Status columns: `CHECK` constraints with explicit allowed values
6. Save every migration to `supabase/migrations/NNN_name.sql` immediately after running

---

## Fan-out rule
Use correlated subqueries, never JOINs for aggregations:
```sql
-- BAD: fan-out from JOIN
SELECT e.id, COUNT(n.id) FROM enquiries e LEFT JOIN notes n ON n.enquiry_id = e.id GROUP BY e.id;

-- GOOD: correlated subquery
SELECT e.id, (SELECT COUNT(*) FROM notes n WHERE n.enquiry_id = e.id) FROM enquiries e;
```

---

## Never-do list
1. Never `getSession()` — always `getUser()`
2. Never `createAuthClient()` outside `useMemo()`
3. Never service role key on the client
4. Never DROP or RENAME existing columns
5. Never reference `auth.users` directly — use `profiles.id` as FK
6. Never commit Supabase URL or keys
