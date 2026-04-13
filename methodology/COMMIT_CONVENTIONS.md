# BISXP Commit Conventions

All commits across BISXP projects follow this format:

## Format
type(scope): description

## Types
feat(R5): description    — feature built in planned R-session or S-session
fix: description         — bug fix (no FEATURE.md, use PATCH_TEMPLATE.md)
docs: description        — documentation only, no product code
test: description        — tests only, no product code
refactor: description    — no behaviour change, no new tests needed
chore: description       — deps, config, tooling, migrations
security: description    — security fix (reference audit finding ID)

## Scope (optional)
Use session ID for planned work: feat(R5):, feat(S11):
Omit for patches and docs: fix: parseVideoEmbed regex

## Rules
- Present tense: "add" not "added", "fix" not "fixed"
- No period at end
- Body: list what changed and why (not how)
- Reference DEBT-XXX or finding ID if closing a debt item
- Co-Author line when Claude Code built it:
  Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>

## Examples
feat(R4): complete file upload — video presign, multi-photo, type validation
fix: parseVideoEmbed accepts embed/, shorts/, ?si= URLs
docs: add Skills/video-embed.md — AUTHORITATIVE
security: fix DATA-03 explicit column SELECT on public listing routes
chore: migration 013 RLS on bisxp_listings bisxp_vendors bisxp_profiles
