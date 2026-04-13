# SKILL: File Upload
_For: All BISXP marketplace projects (Fetespace, TABRO.IN, Starlight Meadows)_
_Read this before building any file upload feature_
_Status: AUTHORITATIVE — complete implementation built and tested in Fetespace._
_Source project: Fetespace — R4 session (2026-04-11)_
_Promoted from DRAFT: DEBT-F01/F02/F03 closed in R4_
_Last updated: 2026-04-11_

---

## Two-Tier Upload Pattern

### Tier 1: Photo proxy (under 4MB)
Simple path — file bytes pass through Vercel function to Supabase Storage.

```typescript
// API route: POST /api/owner/[slug]/photos/upload
export const maxDuration = 60

export async function POST(req: NextRequest, { params }) {
  const { slug } = await params
  // 1. Auth check (Bearer token or PIN)
  // 2. Extract file from FormData
  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return error(400, 'No file')
  if (file.size > 4 * 1024 * 1024) return error(400, 'File too large (max 4MB)')
  // 3. Convert to buffer and upload
  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `listings/${slug}/photos/${Date.now()}-${random()}.${ext}`
  await supabase.storage.from('fetespace-media').upload(path, buffer, {
    contentType: file.type, upsert: false
  })
  // 4. Get public URL and save to DB
  const { data: { publicUrl } } = supabase.storage
    .from('fetespace-media').getPublicUrl(path)
  // 5. Append to photos[] array on listing
  return NextResponse.json({ url: publicUrl })
}
```

### Tier 2: Video presigned URL (over 4MB)
Vercel has a hard 4.5MB request body limit. Videos MUST bypass Vercel.

**Step 1 — Presign route** (API returns signed URL, never touches file bytes):
```typescript
// POST /api/owner/[slug]/videos/presign
export async function POST(req: NextRequest, { params }) {
  const { slug } = await params
  // Auth check
  const { filename, contentType } = await req.json()
  const path = `listings/${slug}/videos/${Date.now()}-${random()}.${ext}`
  const { data } = await supabase.storage
    .from('fetespace-media')
    .createSignedUploadUrl(path)
  const { data: { publicUrl } } = supabase.storage
    .from('fetespace-media').getPublicUrl(path)
  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path,
    publicUrl
  })
}
```

**Step 2 — Client uploads directly to Supabase** (bypasses Vercel entirely):
```typescript
const { signedUrl, publicUrl } = await presignResponse.json()
await fetch(signedUrl, {
  method: 'PUT',
  headers: { 'Content-Type': file.type },
  body: file  // raw file, NOT FormData
})
```

**Step 3 — Confirm route** (saves URL to DB after upload completes):
```typescript
// POST /api/owner/[slug]/videos/confirm
const { publicUrl } = await req.json()
// Append to videos[] array on listing
```

---

## Checklist

- [ ] Photos use Tier 1 (proxy, max 4MB)
- [ ] Videos use Tier 2 (presigned URL, max 50MB)
- [ ] `export const maxDuration = 60` on all upload routes
- [ ] Client-side size check before upload attempt
- [ ] Route-side size check as backup
- [ ] File type validation (server-side, not just accept= attribute)
- [ ] Bucket is public (for public listing photos/videos)
- [ ] Storage path: `{entity}/{slug}/{type}/{timestamp}-{random}.{ext}`
- [ ] Public URL saved to entity's photos[] or videos[] array
- [ ] Auth verified before upload (Bearer token or PIN)

---

## Anti-patterns (never do)

- ❌ Route video bytes through Vercel (413 error on any file > 4.5MB)
- ❌ Allow 100MB upload through proxy route (TABRO.IN bug)
- ❌ Skip maxDuration on upload routes (function timeout)
- ❌ Use anon key for storage operations (use service role)
- ❌ Accept any file type without validation
- ❌ Store files without entity slug in path (makes cleanup impossible)
