# Verify Checklist — Before Raising PR

Run this checklist after every planned session before pushing.
All items must pass. No exceptions.

## Code quality
- [ ] npx tsc --noEmit — zero errors
- [ ] npm test — test count same or higher than baseline
- [ ] npm run build — clean, no warnings

## Security (if API routes touched)
- [ ] No owner_email, owner_phone, owner_name in public API responses
      curl /api/listings/[slug] | grep -i "owner_" → should return nothing
- [ ] Security headers present in response
      Check Content-Security-Policy, X-Frame-Options in devtools
- [ ] robots.txt disallows admin/portal routes (if infra changed)

## Data
- [ ] No select('*') on public routes — explicit column list used
- [ ] Service role key not in any client file
      grep -rn "SERVICE_ROLE" app/ → zero results

## Documentation
- [ ] CLAUDE_CONTEXT.md updated with this session's changes
- [ ] SESSION_OBSERVATIONS.md entry added with degradation checklist
- [ ] TECHNICAL_DEBT.md updated — resolved items marked, new items added
- [ ] SECURITY-AUDIT-NOTES.md updated if security finding resolved

## Skills
- [ ] If a skill was promoted DRAFT → AUTHORITATIVE, header updated
- [ ] If a new skill was created, Skills/README.md updated

## PR
- [ ] PR raised: develop → preview (or main)
- [ ] PR description includes test plan from FEATURE.md
