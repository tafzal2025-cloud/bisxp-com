# SKILL: Video Embed
_For: All BISXP marketplace projects (Fetespace, TABRO.IN, Starlight Meadows)_
_Read this before building any video URL or embed feature_
_Status: AUTHORITATIVE_
_Source project: Fetespace — lib/video-embed.ts + app/api/owner/[slug]/videos/route.ts_
_Source session: Video URL feature — 2026-04-11_
_Last updated: 2026-04-11_

---

## The pattern

Venue and vendor owners paste YouTube or Vimeo URLs.
The platform stores the raw URL and derives the embed URL at render time.
Videos are displayed as `<iframe>` embeds — no file storage, no CDN cost,
adaptive bitrate playback handled by YouTube/Vimeo automatically.

**Never upload video files to Supabase Storage for listing showcase videos.**
Use presigned uploads only for feed/gallery (short clips, owner-controlled content).
For venue/vendor showcase videos, YouTube/Vimeo URL embeds are the correct pattern.

---

## Tier limits

```typescript
export const VIDEO_LIMITS = {
  basic:        0,   // No video URLs — paid feature
  professional: 5,   // 5 YouTube/Vimeo URLs
  premium:      10,  // 10 YouTube/Vimeo URLs
} as const
```

Basic tier gets zero — video URLs are a meaningful upgrade incentive.
Limits enforced **server-side** in the API route, not just in the UI.

---

## Core utility — lib/video-embed.ts

Copy this file verbatim. It is the single source of truth for
all video URL validation across all BISXP projects.

```typescript
export const VIDEO_LIMITS = {
  basic:        0,
  professional: 5,
  premium:      10,
} as const

export type VideoTier = keyof typeof VIDEO_LIMITS

/**
 * Validates a YouTube or Vimeo URL and returns a safe embed URL.
 * Returns null for any URL that is not a recognised pattern.
 *
 * Security guarantees:
 * - Never fetches the URL server-side (no SSRF risk)
 * - Constructs embed URL from extracted ID only
 * - Raw URL never reaches the DOM as an attribute
 * - YouTube ID validated to exactly 11 chars [a-zA-Z0-9_-]
 * - Vimeo ID validated to numeric only, 6-10 digits
 */
export function parseVideoEmbed(url: string): {
  embedUrl: string
  platform: 'youtube' | 'vimeo'
  videoId: string
} | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()

  // YouTube: watch?v=, embed/, shorts/, youtu.be/
  const yt = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[&?]|$)/
  )
  if (yt) {
    return {
      embedUrl: `https://www.youtube.com/embed/${yt[1]}`,
      platform: 'youtube',
      videoId: yt[1],
    }
  }

  // Vimeo: vimeo.com/ID (numeric only, 6-10 digits)
  const vm = trimmed.match(/(?:vimeo\.com\/)(\d{6,10})(?:[/?]|$)/)
  if (vm) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vm[1]}`,
      platform: 'vimeo',
      videoId: vm[1],
    }
  }

  return null
}

export function getVideoLimit(tier: string): number {
  return VIDEO_LIMITS[tier as VideoTier] ?? 0
}

export function canAddVideo(currentCount: number, tier: string): boolean {
  return currentCount < getVideoLimit(tier)
}
```

---

## API route — add/remove video URLs

One route handles both add (POST) and remove (DELETE).
Server validates the URL independently of the client.

```typescript
// app/api/owner/[slug]/videos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { verifyOwnerAccess } from '@/lib/api-auth'
import { parseVideoEmbed, getVideoLimit } from '@/lib/video-embed'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  if (!await verifyOwnerAccess(req, slug)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { url } = await req.json()
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  // Security: server-side validation — never trust client
  const parsed = parseVideoEmbed(url.trim())
  if (!parsed) {
    return NextResponse.json(
      { error: 'Invalid URL. Please use a YouTube or Vimeo video URL.' },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()
  const { data: listing } = await supabase
    .from('bisxp_listings')
    .select('videos, tier')
    .eq('slug', slug)
    .single()

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  const limit = getVideoLimit(listing.tier)
  const current = listing.videos || []

  // Tier gate — enforced server-side
  if (limit === 0) {
    return NextResponse.json(
      { error: 'Video URLs require a Professional or Premium plan.' },
      { status: 403 }
    )
  }

  if (current.length >= limit) {
    return NextResponse.json(
      { error: `Video limit reached (${limit} for your plan).` },
      { status: 400 }
    )
  }

  // Duplicate check
  if (current.includes(url.trim())) {
    return NextResponse.json(
      { error: 'This video URL has already been added.' },
      { status: 400 }
    )
  }

  // Store raw URL — embed URL derived at render time
  const updated = [...current, url.trim()]
  await supabase
    .from('bisxp_listings')
    .update({ videos: updated })
    .eq('slug', slug)

  return NextResponse.json({
    success: true,
    videos: updated,
    embedUrl: parsed.embedUrl,
    platform: parsed.platform,
  })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  if (!await verifyOwnerAccess(req, slug)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { url } = await req.json()
  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data: listing } = await supabase
    .from('bisxp_listings')
    .select('videos')
    .eq('slug', slug)
    .single()

  const updated = (listing?.videos || []).filter((v: string) => v !== url)
  await supabase
    .from('bisxp_listings')
    .update({ videos: updated })
    .eq('slug', slug)

  return NextResponse.json({ success: true, videos: updated })
}
```

For vendor routes: swap `verifyOwnerAccess` → `verifyVendorAccess`,
`bisxp_listings` → `bisxp_vendors`.

---

## Portal UI — video URL input

```tsx
// In the photos tab, after the photo grid

import { parseVideoEmbed, getVideoLimit, canAddVideo } from '@/lib/video-embed'

// State
const [videoUrl, setVideoUrl] = useState('')
const [videoError, setVideoError] = useState('')
const [videoAdding, setVideoAdding] = useState(false)

// Handler
const addVideoUrl = async () => {
  setVideoError('')
  if (!videoUrl.trim()) return

  // Client pre-validates — mirrors server (fast feedback)
  if (!parseVideoEmbed(videoUrl.trim())) {
    setVideoError('Please enter a valid YouTube or Vimeo URL.')
    return
  }

  setVideoAdding(true)
  const res = await fetch(`/api/owner/${slug}/videos`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ url: videoUrl.trim() }),
  })
  const data = await res.json()
  if (!res.ok) {
    setVideoError(data.error || 'Failed to add video')
  } else {
    setVenue(v => v ? { ...v, videos: data.videos } : v)
    setVideoUrl('')
  }
  setVideoAdding(false)
}

const removeVideoUrl = async (url: string) => {
  const res = await fetch(`/api/owner/${slug}/videos`, {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ url }),
  })
  if (res.ok) {
    const data = await res.json()
    setVenue(v => v ? { ...v, videos: data.videos } : v)
  }
}

// JSX
{(() => {
  const tier = venue?.tier || 'basic'
  const limit = getVideoLimit(tier)
  const current = venue?.videos || []

  if (limit === 0) {
    return (
      <div style={{ marginTop: 32, paddingTop: 24,
        borderTop: '1px solid var(--border)' }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif",
          fontSize: 20, color: 'var(--ink)', marginBottom: 8 }}>
          Videos
        </h3>
        <div style={{ padding: '16px 20px',
          background: 'rgba(201,168,76,0.04)',
          border: '1px dashed rgba(201,168,76,0.3)',
          borderRadius: 8, fontFamily: 'Inter, sans-serif',
          fontSize: 13, color: 'var(--muted)' }}>
          Video URLs are available on Professional (5 videos)
          and Premium (10 videos) plans.
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 32, paddingTop: 24,
      borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'baseline', marginBottom: 8 }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif",
          fontSize: 20, color: 'var(--ink)' }}>Videos</h3>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12,
          color: 'var(--muted)' }}>{current.length}/{limit} used</span>
      </div>
      <p className="op-sub" style={{ marginBottom: 12 }}>
        Add YouTube or Vimeo video URLs to showcase your venue.
      </p>

      {canAddVideo(current.length, tier) && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            className="op-input"
            style={{ flex: 1 }}
            placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
            value={videoUrl}
            onChange={e => { setVideoUrl(e.target.value); setVideoError('') }}
            onKeyDown={e => e.key === 'Enter' && addVideoUrl()}
          />
          <button
            className="op-save-btn"
            style={{ height: 48, padding: '0 20px', fontSize: 12 }}
            onClick={addVideoUrl}
            disabled={videoAdding || !videoUrl.trim()}>
            {videoAdding ? 'Adding...' : 'Add'}
          </button>
        </div>
      )}

      {videoError && (
        <p className="op-save-err" style={{ marginBottom: 8 }}>{videoError}</p>
      )}

      {current.map((url, i) => {
        const parsed = parseVideoEmbed(url)
        return (
          <div key={url} style={{ marginBottom: 16 }}>
            {parsed ? (
              <iframe
                src={parsed.embedUrl}
                style={{ width: '100%', aspectRatio: '16/9',
                  borderRadius: 8, border: '1px solid var(--border)' }}
                allow="accelerometer; autoplay; clipboard-write;
                  encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div style={{ padding: 12,
                background: 'rgba(220,38,38,0.06)', borderRadius: 8,
                fontFamily: 'Inter, sans-serif', fontSize: 12,
                color: '#DC2626' }}>
                Invalid URL: {url}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginTop: 6 }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11,
                color: 'var(--muted)' }}>
                {parsed?.platform === 'youtube' ? 'YouTube' : 'Vimeo'}
                {' · '}Video {i + 1}
              </span>
              <button
                onClick={() => removeVideoUrl(url)}
                style={{ fontFamily: 'Inter, sans-serif', fontSize: 11,
                  color: '#DC2626', background: 'none',
                  border: '1px solid rgba(220,38,38,0.3)',
                  borderRadius: 4, padding: '3px 10px', cursor: 'pointer' }}>
                Remove
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
})()}
```

---

## Detail page display

```tsx
// In venue/vendor detail page — after photos section
import { parseVideoEmbed } from '@/lib/video-embed'

{(venue.videos?.length ?? 0) > 0 && (
  <section style={{ padding: '48px 40px',
    borderTop: '1px solid rgba(15,15,20,0.08)' }}>
    <h2 style={{ fontFamily: "'Cormorant Garamond', serif",
      fontSize: 32, marginBottom: 24 }}>
      Video Tours
    </h2>
    <div style={{ display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: 20 }}>
      {venue.videos.map((url: string) => {
        const parsed = parseVideoEmbed(url)
        if (!parsed) return null
        return (
          <iframe
            key={url}
            src={parsed.embedUrl}
            style={{ width: '100%', aspectRatio: '16/9',
              borderRadius: 12, border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write;
              encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )
      })}
    </div>
  </section>
)}
```

---

## Security model

### Threats addressed

**SSRF (Server-Side Request Forgery)**
The server never fetches the submitted URL. Validation is purely regex —
no outbound HTTP request is made. An attacker cannot use this endpoint
to probe internal network addresses.

**Malicious iframe injection**
`parseVideoEmbed()` returns `null` for anything not matching YouTube/Vimeo
patterns. The embed URL is constructed from the extracted video ID only —
`https://www.youtube.com/embed/{11-char-id}` — never from the raw URL.
Even if a crafted URL bypasses the domain check, the constructed embed URL
points to YouTube/Vimeo, not the attacker's domain.

**XSS via URL field**
Raw URL is stored as text, passed through `parseVideoEmbed()`, and only
the constructed embed URL reaches the DOM as an `src` attribute.
React escapes string values in attributes automatically.
The `javascript:` protocol cannot reach the DOM as an iframe `src`.

**ID format injection**
YouTube ID regex requires exactly 11 chars from `[a-zA-Z0-9_-]`.
Vimeo ID regex requires 6-10 numeric digits only.
Even a URL that passes the domain check cannot inject arbitrary content
into the embed URL if the ID format check fails.

**Tier abuse**
Tier limit checked server-side against the database record — not against
a client-supplied value. A client claiming to be Premium cannot add more
videos than their actual tier allows.

**Duplicate URLs**
Server checks `current.includes(url.trim())` before appending.
Prevents the same video from appearing multiple times on a listing.

### What is NOT covered

**Content moderation** — a valid YouTube URL pointing to inappropriate
content will pass validation. Mitigations:
- YouTube/Vimeo moderate their platforms
- Admin dashboard displays all video URLs per listing
- Terms of service make the owner responsible for their content
- Admin can remove any video URL from a listing

**URL expiry** — YouTube/Vimeo videos can be deleted or made private
after the URL is saved. The iframe will show an error state in that case.
No active monitoring of stored URLs is implemented.

---

## Data storage

Store the **raw URL** the owner pasted. Derive the embed URL at render time.

```
bisxp_listings.videos  text[]  DEFAULT '{}'
bisxp_vendors.videos   text[]  DEFAULT '{}'
```

Stored value: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
Rendered as:  `https://www.youtube.com/embed/dQw4w9WgXcQ` (constructed at render)

**Why raw URL:**
- Human-readable and auditable in the admin dashboard
- If YouTube/Vimeo changes their embed format, update one function
- Admin can display the original URL alongside the embed

---

## Tests — minimum required

20 tests proven in Fetespace. File: `lib/__tests__/video-embed.test.ts`

| Group | Count | Covers |
|---|---|---|
| YouTube URL parsing | 5 | standard URL, short URL, query params, invalid ID length, invalid chars |
| Vimeo URL parsing | 2 | standard URL, non-numeric ID |
| Security cases | 6 | evil.com, javascript:, 169.254.x.x, empty string, null, embed URL isolation |
| Tier limits | 7 | basic=0, professional=5, premium=10, unknown=0, at limit, under limit, basic always false |

All tests must pass before promoting to any new project.

---

## Adapting for other BISXP projects

| Setting | Fetespace | TABRO.IN | Starlight |
|---|---|---|---|
| Auth (owner) | `verifyOwnerAccess` | owner token validation | PIN header |
| Auth (vendor) | `verifyVendorAccess` | vendor token validation | PIN header |
| Listings table | `bisxp_listings` | `venues` | `sl_venues` (if applicable) |
| Vendors table | `bisxp_vendors` | `vendors` | `sl_vendors` |
| Bucket (not used for video URLs) | `fetespace-media` | `venue-photos` | `sl-media` |
| CSS variables | `--ink`, `--gold`, `--border`, `--muted` | same | `--sl-primary`, `--sl-accent` |

The `parseVideoEmbed()`, `getVideoLimit()`, and `canAddVideo()` functions
are identical across all projects — copy `lib/video-embed.ts` verbatim.
Only the auth pattern and table names change per project.

---

## Checklist before shipping

- [ ] `lib/video-embed.ts` copied verbatim (do not rewrite)
- [ ] `parseVideoEmbed()` used server-side before any DB write
- [ ] Tier limit enforced server-side (check DB tier, not client value)
- [ ] Duplicate URL check before appending
- [ ] Raw URL stored, embed URL derived at render
- [ ] Client pre-validates with `parseVideoEmbed()` for fast feedback
- [ ] iframe uses `allow="..."` attribute for autoplay/fullscreen
- [ ] Basic tier shows upgrade prompt (not an error)
- [ ] Count/limit displayed in portal (N/limit used)
- [ ] `videos: string[]` in entity interface
- [ ] Detail page has "Video Tours" section (hidden when empty)
- [ ] All 20 tests pass in the new project
