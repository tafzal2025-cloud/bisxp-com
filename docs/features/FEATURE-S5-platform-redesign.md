# Feature: Platform Company Redesign + SEO Foundation
_Status: Approved_
_Date: 2026-04-08_
_Save to: docs/features/FEATURE-S5-platform-redesign.md_
_Project: BISXP.com (tafzal2025-cloud/bisxp-com)_
_Session: 5_

---

## Problem Statement

BISXP.com currently positions as a consultancy —
"We don't just advise. We build." This is the wrong
message for a platform company. The site needs a
full repositioning to "The Platform for AI-Native
Marketplaces" before SEO work begins.

Optimising the wrong message would index the wrong
story in Google.

---

## What Changes

### Positioning shift
Consultancy → Platform company
Services → Platform components
Case studies → Partner reference implementations
Single CTA → Three differentiated CTAs

### Content changes
- Hero: new headline, subheadline, dual CTAs
- Stats bar: updated to platform metrics
- Portfolio section: reframed as partner stories
  with real partner context
- Services section: replaced with Platform
  Components (8 tiles)
- Who We Work With: replaced with 3 persona cards
- Process section: replaced with BISXP Methodology
  (2 tracks, training partners)
- Team: Tharif only, updated bio
- Contact: split into 3 differentiated CTAs

### New sections
- Platform components grid (8 tiles)
- Three-persona "Who Builds on BISXP" section
- BISXP Methodology with two tracks

### SEO added in same session
- Root metadata (title, description, OG, Twitter)
- JSON-LD ProfessionalService schema
- sitemap.ts
- robots.ts
- /api/og dynamic OG image

---

## Content Source

All copy from: BISXP-Platform-Positioning.md
(save to repo root before running Claude Code)

---

## Database Changes

### bisxp_settings keys to update
All new section headings and copy go into the
existing bisxp_settings table so they're editable
from the admin Content Editor.

New/updated keys:
- hero_headline: 'The Platform for'
- hero_headline_em: 'AI-Native Marketplaces.'
- hero_subheadline: 'Build marketplace businesses on production-tested architecture...'
- services_section_heading: 'Everything a marketplace needs. Built once.'
- services_platform_line: 'The BISXP platform is a full-stack foundation...'
- process_section_heading: 'The system behind the platform.'
- contact_heading: 'Three ways to work with BISXP.'
- contact_subheading: 'Start a project, become a build partner, or become a training partner.'
- team_section_heading: 'Built by someone who has done it at scale.'

### bisxp_case_studies updates (via admin CMS)
Update the 4 existing case study cards with new
partner context copy from positioning doc.
Add partner name field to each card.

### New bisxp_settings keys
- section_personas_visible: 'true'
- personas_section_heading: 'Three paths. One platform.'
- section_methodology_visible: 'true'
- methodology_section_heading: 'BISXP Methodology'
- methodology_track1_title: 'Marketplace Building'
- methodology_track1_body: '...'
- methodology_track2_title: 'AI Data Engineering'
- methodology_track2_body: '...'
- section_platform_visible: 'true'
- platform_section_heading: 'Everything a marketplace needs. Built once.'

---

## Migration

```sql
-- Migration 005: Platform redesign settings
-- Date: 2026-04-08 | Session 5

INSERT INTO bisxp_settings (key, value, label, section, sort_order)
VALUES
  ('section_personas_visible', 'true',
   'Show personas section', 'visibility', 7),
  ('section_methodology_visible', 'true',
   'Show methodology section', 'visibility', 8),
  ('section_platform_visible', 'true',
   'Show platform section', 'visibility', 9),
  ('personas_section_heading', 'Three paths. One platform.',
   'Personas section heading', 'personas', 1),
  ('methodology_section_heading', 'BISXP Methodology',
   'Methodology section heading', 'methodology', 1),
  ('methodology_intro', 'The BISXP Methodology is a structured approach to building AI-native products — from architecture decisions on day one through to GTM and scaling.',
   'Methodology intro', 'methodology', 2),
  ('methodology_track1_title', 'Marketplace Building',
   'Track 1 title', 'methodology', 3),
  ('methodology_track1_body', 'Learn to architect, build, and launch a two-sided marketplace. Capstone: a live marketplace deployed to production.',
   'Track 1 body', 'methodology', 4),
  ('methodology_track2_title', 'AI Data Engineering',
   'Track 2 title', 'methodology', 5),
  ('methodology_track2_body', 'Learn to build the data pipelines and AI workflows that power modern marketplace intelligence. Based on patterns from AWS AppFlow, Glue Streaming, and Zero ETL integrations across enterprise systems. Capstone: a production AI data pipeline.',
   'Track 2 body', 'methodology', 6),
  ('platform_section_heading', 'Everything a marketplace needs. Built once.',
   'Platform section heading', 'platform', 1),
  ('platform_intro', 'The BISXP platform is a full-stack foundation for marketplace businesses. Every component is production-tested across live deployments — not theoretical architecture.',
   'Platform intro', 'platform', 2)
ON CONFLICT (key) DO NOTHING;
```

---

## File Impact Table

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/005_platform_redesign.sql` | Create | New settings keys |
| `app/page.tsx` | Modify | Full homepage redesign |
| `app/layout.tsx` | Modify | Root metadata + JSON-LD |
| `app/method/layout.tsx` | Create | Method page meta |
| `app/sitemap.ts` | Create | sitemap.xml |
| `app/robots.ts` | Create | robots.txt |
| `app/api/og/route.tsx` | Create | Dynamic OG image |
| `BISXP-Platform-Positioning.md` | Reference | All copy source |

---

## Acceptance Criteria

### Positioning
- [ ] Hero says "The Platform for AI-Native Marketplaces"
- [ ] Three CTAs: Start a Project, Become a Build Partner,
  Become a Training Partner
- [ ] Partner reference implementations replace case studies
  (with real partner context)
- [ ] Platform components section (8 tiles) replaces services
- [ ] Three-persona section shows solo founder, agency, enterprise
- [ ] BISXP Methodology section shows 2 tracks
- [ ] Team section shows Tharif only with updated bio
- [ ] Contact section has 3 differentiated paths

### SEO
- [ ] Browser tab shows "BISXP — The Platform for AI-Native Marketplaces"
- [ ] /sitemap.xml returns valid XML
- [ ] /robots.txt returns valid text
- [ ] /api/og returns 1200×630 image
- [ ] Sharing bisxp.com on WhatsApp shows OG preview

### Technical
- [ ] npx tsc --noEmit clean
- [ ] npm test passing
- [ ] All existing admin functionality unchanged
- [ ] Content Editor still works for all editable fields
- [ ] New settings keys appear in Content Editor
