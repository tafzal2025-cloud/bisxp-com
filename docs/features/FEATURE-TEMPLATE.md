# Feature: [FEATURE NAME]
_Copy this template to `docs/features/FEATURE-[name].md` before starting any feature work._
_Status: Draft | Approved | In Progress | Complete_

---

## Problem Statement

**What problem does this solve?**
<!-- 2–3 sentences describing the user pain point or business need -->

**Who benefits?**
<!-- Which persona: prospective client, admin (Shah), or public visitor -->

**How do we know it's solved?**
<!-- Measurable outcome: metric, user action, or system state -->

---

## Out of Scope

<!-- Explicitly list what this feature does NOT include to prevent scope creep -->

- [ ] Item 1
- [ ] Item 2

---

## Schema Changes

### New Tables

```sql
-- Table: table_name
-- Purpose: [why this table exists]
CREATE TABLE IF NOT EXISTS table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- columns here
);
```

### Column Additions to Existing Tables

```sql
-- Adding to: [table_name]
-- Reason: [why this column is needed]
ALTER TABLE table_name ADD COLUMN IF NOT EXISTS column_name TYPE DEFAULT value;
```

### RLS Policies

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY "policy_name" ON table_name FOR SELECT USING (...);
```

---

## API Contracts

### Endpoint 1: `METHOD /api/route`

**Auth:** Required (admin) / Public
**Request:**
```json
{
  "field": "type — description"
}
```

**Response (200):**
```json
{
  "field": "type — description"
}
```

**Error responses:** 400 (validation), 401 (unauthenticated), 500 (server error)

---

## SOLID Audit

| Principle | How This Feature Complies |
|-----------|--------------------------|
| **S** — Single Responsibility | Each new file does exactly one thing: [describe] |
| **O** — Open/Closed | Extends existing system by [describe], does not modify [describe] |
| **L** — Liskov Substitution | [describe or N/A] |
| **I** — Interface Segregation | Props/params contain only what each consumer needs |
| **D** — Dependency Inversion | Business logic in `lib/`, routes import from `lib/` |

---

## File Impact Table

| File | Action | Lines (est.) | Purpose |
|------|--------|-------------|---------|
| `supabase/migrations/NNN_feature.sql` | Create | ~30 | Database schema |
| `lib/feature.ts` | Create | ~40 | Business logic (if needed) |
| `app/api/feature/route.ts` | Create | ~60 | API endpoint |
| `app/components/Feature.tsx` | Create | ~150 | UI component |
| `tests/unit/feature-api.test.ts` | Create | ~60 | Unit tests |
| `CLAUDE_CONTEXT.md` | Modify | +15 | Documentation |

**Total estimated new lines:** ~355
**Files over 300 lines:** None expected

---

## Test Plan

### Unit Tests (required — written alongside code, not at end)

| Test | What it verifies |
|------|-----------------|
| `returns 401 when unauthenticated` | Auth guard works |
| `returns 200 with valid data` | Happy path |
| `returns 400 with invalid input` | Validation |
| `handles database errors gracefully` | Error handling |

---

## Integration Test Requirements

List every API route this feature creates or modifies that writes to the database.

| Route | Operation | Integration test |
|-------|-----------|-----------------|
| POST /api/route | Creates row | submit → query DB → expect row exists |

Claude Code cannot mark a feature complete until these tests exist
in `tests/integration/` and pass against the real Supabase project.

If this feature has no DB writes: write "No DB writes — N/A"

---

## Acceptance Criteria

- [ ] All unit tests pass
- [ ] Integration tests pass against real Supabase
- [ ] No file exceeds 500 lines
- [ ] No hardcoded hex colors
- [ ] No `console.log` in production code
- [ ] Mobile responsive (390px)
- [ ] Loading states for all async operations
- [ ] CLAUDE_CONTEXT.md updated
- [ ] SESSION_OBSERVATIONS.md updated
- [ ] TypeScript compiles with `npx tsc --noEmit`

---

## Claude Code Instructions

_Paste this block into Claude Code to begin implementation._
_Written by Claude.ai after Shah approves the feature design above._

```
[Instructions for Claude Code go here]

IMPORTANT: For every STEP that creates an API route, immediately after:
"Write tests/unit/[feature]-api.test.ts for this route.
Run npm test — must pass before continuing to the next step."
Tests are written alongside code, not as a final batch step.
```
