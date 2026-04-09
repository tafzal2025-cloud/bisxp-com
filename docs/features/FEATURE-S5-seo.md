# Feature: SEO Foundation
_Status: Approved_
_Date: 2026-04-08_
_Save to: docs/features/FEATURE-S5-seo.md_
_Project: BISXP.com (tafzal2025-cloud/bisxp-com)_
_Session: 5_

---

## Problem Statement

BISXP.com is live but invisible to Google. Typing "BISXP"
returns no results. The site has no meta tags, no sitemap,
no robots.txt, no structured data, and no OG image.

This session fixes all of that.

---

## Out of Scope

- [ ] Blog or content marketing
- [ ] Link building campaigns
- [ ] Google Ads
- [ ] Analytics beyond Search Console
- [ ] Per-page dynamic meta from DB (future session)

---

## What We're Building

### 1. Meta Tags (app/layout.tsx)
- title: "BISXP — AI-Native Marketplace & SaaS Builders"
- description: "We build AI-native marketplaces and SaaS products.
  Four live platforms across India, USA, and Canada.
  Blueprint. Ignite. Scale. Xperience."
- keywords: marketplace development, SaaS development,
  AI integration, two-sided marketplace, BISXP
- canonical: https://bisxp.com
- robots: index, follow
- Open Graph: title, description, image, url, type
- Twitter Card: summary_large_image

### 2. /method page meta tags
- title: "The BISXP Method — 3-Day Marketplace Immersion"
- description: "Build and deploy a live marketplace MVP in 3 days.
  Hands-on programme for founders and technical teams."

### 3. sitemap.xml (app/sitemap.ts)
Dynamic sitemap returning all public pages:
- / (homepage)
- /method
- changefreq, priority, lastmod per page

### 4. robots.txt (app/robots.ts)
Allow all crawlers. Point to sitemap.

### 5. JSON-LD Organization Schema (app/layout.tsx)
Tells Google what BISXP is:
```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "BISXP",
  "url": "https://bisxp.com",
  "logo": "https://bisxp.com/bisxp-og.png",
  "description": "AI-native marketplace and SaaS development consultancy",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "US"
  },
  "sameAs": []
}
```

### 6. OG Image API (app/api/og/route.tsx)
Dynamic 1200×630 OG image using @vercel/og.
Shows: BISXP logo text + tagline + dark background.
Used by og:image meta tag.

### 7. Favicon
If no favicon exists, add a simple one using the
existing brand colors. Place in app/favicon.ico or
as a PNG in public/.

---

## Target Search Queries

After this session BISXP should rank for:
- "BISXP" (brand — highest priority)
- "bisxp.com"
- "AI marketplace builder"
- "marketplace development consultancy"
- "two-sided marketplace development"
- "SaaS product development India"

---

## File Impact Table

| File | Action | Purpose |
|------|--------|---------|
| `app/layout.tsx` | Modify | Root metadata + JSON-LD schema |
| `app/method/layout.tsx` | Create | /method page meta tags |
| `app/sitemap.ts` | Create | Dynamic sitemap.xml |
| `app/robots.ts` | Create | robots.txt |
| `app/api/og/route.tsx` | Create | Dynamic OG image |
| `public/bisxp-og.png` | Create | Static OG fallback |
| `CLAUDE_CONTEXT.md` | Modify | Document new routes |

---

## Acceptance Criteria

- [ ] https://bisxp.com has correct title in browser tab
- [ ] View Source shows meta description
- [ ] https://bisxp.com/sitemap.xml returns valid XML
- [ ] https://bisxp.com/robots.txt returns valid text
- [ ] https://bisxp.com/api/og returns a 1200x630 image
- [ ] Sharing bisxp.com link on WhatsApp shows OG preview
- [ ] Google Search Console → URL Inspection → bisxp.com
  → shows meta title and description correctly
- [ ] npx tsc --noEmit clean
- [ ] npm test — all passing
