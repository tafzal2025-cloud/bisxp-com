# BISXP Master Methodology
_The operating system for every BISXP marketplace project._
_Maintained by: Shah (Owner) + Claude.ai (Architect) + Claude Code (Builder)_
_Cross-project source of truth. Per-project files live in each repo._
_Reference: bisxp.com/method_

---

## Why This Document Exists

Every BISXP marketplace — Fetespace, TABRO.IN, Starlight Meadows, and every future deployment — runs on the same methodology. This document is the single source of truth for how we operate across all projects.

The methodology is what we sell to clients. Every decision we make here — good or bad — is what we teach others. If it doesn't work here, we cannot sell it.

Any Claude.ai session that does not see all seven BISXP artifacts in place must flag the violation before doing any planning or architectural work. Any Claude Code session that does not see all seven artifacts must stop and report before writing a single line of code.

This is not optional. It is the discipline that makes everything else work.

---

## The Seven BISXP Artifacts

These are the seven artifacts we publicly commit to at bisxp.com/method.
All seven must exist in every active BISXP project at all times.

| # | Artifact | Purpose | Owner |
|---|----------|---------|-------|
| 1 | `FEATURE.md` | Blueprint — what will be built this session | Claude.ai writes, Shah approves |
| 2 | `CLAUDE.md` | Standing instructions — permanent rules for every agent | Shah + Claude.ai |
| 3 | `CLAUDE_CONTEXT.md` | Shared memory — full current state of the codebase | Claude Code updates every session |
| 4 | `SESSION_CONTRACT.md` | Session scope — roles, rules, branch strategy, checklists | Shah approves |
| 5 | `SESSION_OBSERVATIONS.md` | Institutional memory — every session's health record | Claude Code updates every session |
| 6 | `skills/` | Reusable capabilities — patterns encoded as skill files | Claude.ai authors, Claude Code uses |
| 7 | `TECHNICAL_DEBT.md` | Honest accounting — every known gap, prioritised | Claude Code updates, Shah reviews |

Additionally required for every marketplace project:
- `[PROJECT]_METHODOLOGY.md` — project-specific scores, session history, ranked plan
- `BISXP_MARKETPLACE_FIRST_PRINCIPLES.md` (this repo) — the 10 principles every session serves
- `BISXP_MARKETPLACE_PATTERN.md` (this repo) — canonical technical pattern

---

## The Two-AI Workflow

```
Shah (Owner)
    │
    │ approves FEATURE.md
    ▼
Claude.ai (Architect) ──────────────────────────────────────────────┐
    │                                                                │
    │ 1. Runs principle check (which principle? current score?)      │
    │ 2. Reads investigation report (is this the right priority?)    │
    │ 3. Writes FEATURE.md (zero ambiguity spec)                     │
    │ 4. Writes instruction widget (HTML, copy button)               │
    │                                                                │
    │ Shah approves ──────────────────────────────────────────────── │
    ▼                                                                │
Claude Code (Builder)                                               │
    │                                                                │
    │ Session Start:                                                  │
    │   Step 0: Artifact check — flag any missing, STOP if so        │
    │   Step 1: Read all mandatory docs                              │
    │   Step 2: State principle check out loud                       │
    │   Step 3: git pull, npm test baseline, tsc --noEmit            │
    │                                                                │
    │ Build:                                                         │
    │   Follow FEATURE.md exactly                                    │
    │   Use skill files for known patterns                           │
    │   Run tsc + tests before every commit                          │
    │   Never exceed 500 lines per file                              │
    │                                                                │
    │ Session End:                                                   │
    │   Update CLAUDE_CONTEXT.md                                     │
    │   Update SESSION_OBSERVATIONS.md (with degradation checklist)  │
    │   Update TECHNICAL_DEBT.md (new debt in, resolved debt out)    │
    │   Update [PROJECT]_METHODOLOGY.md scores                       │
    │   Raise PR: develop → preview                                  │
    │                                                                │
    └────────────────────────────────────────────────────────────────┘
         Claude.ai reviews PR output, plans next session
```

---

## Skill File Discipline

**Before creating or updating any file in `skills/`:**
1. Read the existing file in full — if it exists.
2. Check related skills to confirm no overlap.
3. After reading, choose one of three actions only:
   - Append a new section (new learnings not yet covered)
   - Replace a stale section (implementation has changed)
   - Make no changes (existing content already covers it)
4. Never duplicate content across skill files.
5. Never write a skill file cold without reading first.

**Skill scope comes from FEATURE.md, not from the session type.**
Every FEATURE.md must declare a `## Skills required` section listing the specific skill files Claude Code must read before writing any code. Claude Code reads exactly those files — no more, no less. The FEATURE.md author decides what is relevant when writing the spec.

**Skill files are written from proven implementations only.**
A skill is authoritative only after a feature is:
- Tested (unit tests passing)
- Live in production
- Edge cases handled and documented

The source project must be named in the skill file header. Aspirational or speculative content is not permitted in skill files.

**When a skill gap is found in another project:**
- It becomes a DEBT item (DEBT-NNN) with priority P1-P3
- It enters the R-session queue — not emergency work
- The R-session uses the skill file as the acceptance criterion
- "Done" means the implementation matches the skill's checklist

**When an implementation improves on the skill:**
- Update the skill file after the session, not before
- Note the improvement and which project/session discovered it
- The better-tested implementation becomes the new reference

### Skill Status: DRAFT vs AUTHORITATIVE

Every skill file carries one of two statuses in its header:

**DRAFT** — Architecture is directionally correct but the full unified implementation has not been built and proven in a BISXP project end-to-end. A DRAFT skill may reference partial implementations from one or more projects, or contain target code that has not yet been exercised in production.
- Claude Code MAY use a DRAFT skill as a build spec
- Claude Code MUST NOT treat DRAFT code as copy-paste reference
- The FEATURE.md must note that the skill is DRAFT status

**AUTHORITATIVE** — The complete implementation has been built, tested, and is live in the designated source project. All code in the skill file reflects exactly what is in production.
- Claude Code uses AUTHORITATIVE skill code as direct reference
- Other projects are validated against it and brought to compliance via R-sessions
- The source project and session are named in the skill header

**Promotion from DRAFT to AUTHORITATIVE:**
A skill is promoted after the following are true:
1. The full implementation is built in the designated source project (usually Fetespace as the cleanest codebase)
2. All checklist items in the skill pass in that project
3. Tests cover the implementation
4. The skill header is updated: status, source project, source session, date

**The promotion rule:**
When a skill is DRAFT, the next step is always to build the complete implementation in Fetespace (or the designated build project) before validating other projects against it. Never validate TABRO.IN or Starlight against a DRAFT skill. Validate only against AUTHORITATIVE skills.

**Preferred build order for new features:**
1. Build complete in Fetespace (cleanest stack, unified patterns, no legacy)
2. Promote skill to AUTHORITATIVE with Fetespace as source
3. Run read-first in TABRO.IN — gaps become DEBT items
4. Run read-first in Starlight — gaps become DEBT items
5. Close gaps via R-sessions in each project

---

## Session Types

There are three types of sessions. They are planned in this order:
R-sessions before S-sessions. Methodology before features.

### R-Sessions — Refactor and Debt Reduction
- Serve the methodology and codebase health, not product features
- Address items in TECHNICAL_DEBT.md by priority (P1 first)
- May also address methodology gaps (missing artifacts, skill files)
- No new user-facing features
- Always increase test count
- Named: R1, R2, R3...

**R-sessions are planned before S-sessions when:**
- Any P1 debt item exists
- Any BISXP artifact is missing
- Any file exceeds 500 lines
- Test count is below the project minimum

### S-Sessions — Feature Sessions
- Serve one specific marketplace first principle
- Require an approved FEATURE.md before starting
- Must answer the principle check before planning begins
- Named: S1, S2... (continuing per project)

**S-sessions are planned in principle score order:**
- Always address the lowest-scoring principle first
- Never skip a critical principle to build a partial one
- Exception: if a partial principle is blocking a critical one

### Patch / Hotfix Sessions
- Urgent production fixes only
- Named: patch-N or hotfix-N
- No FEATURE.md required — use PATCH_TEMPLATE.md instead
- Must update TECHNICAL_DEBT.md as resolved debt
- Commit prefix: `fix:` or `hotfix:`

---

## SDLC Phase Taxonomy

Every session maps to one of six SDLC phases. This makes it explicit
what kind of work is happening and which rules apply.

| Phase | Purpose | Primary session types |
|---|---|---|
| **Define** | Identify the problem, confirm priority, draft requirements | Planning (no code) |
| **Plan** | Write FEATURE.md, design schema, enumerate file impact | Claude.ai sessions |
| **Build** | Implement per FEATURE.md, write tests alongside code | S-sessions, R-sessions |
| **Verify** | Run tsc, tests, security checks, mobile checks, VERIFY_CHECKLIST.md | End of every Build session |
| **Review** | Shah reviews PR, Claude.ai audits output vs FEATURE.md acceptance criteria | Between push and merge |
| **Ship** | Merge to main, verify deployment, update CLAUDE_CONTEXT.md | After PR approval |

Map session types to phases:
- **Planning session (Claude.ai only)** → Define + Plan
- **R-session** → Build + Verify
- **S-session** → Build + Verify
- **Patch / Hotfix** → Build + Verify (compressed)
- **PR review** → Review
- **Post-merge** → Ship

Every session reports its primary phase in the SESSION START REPORT.

---

## Session Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ COLD START                                                  │
│  → Read 9 files in order (see SESSION_START.md)            │
│  → Produce SESSION START REPORT                             │
│  → Verify baseline: git pull, npm test, tsc --noEmit        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ EXECUTE                                                     │
│  → Follow FEATURE.md exactly (R-session: follow debt list)  │
│  → Read Skills listed in ## Skills required                 │
│  → Run tsc + tests before every commit                      │
│  → Never exceed 500 lines per file                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ VERIFY                                                      │
│  → Run VERIFY_CHECKLIST.md                                  │
│  → tsc clean, tests ≥ baseline, security checks pass        │
│  → Mobile check on new UI                                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ DOCS                                                        │
│  → Update CLAUDE_CONTEXT.md                                 │
│  → Update SESSION_OBSERVATIONS.md (degradation checklist)   │
│  → Update TECHNICAL_DEBT.md (resolved + new)                │
│  → Update [PROJECT]_METHODOLOGY.md scores                   │
│  → Promote skill DRAFT → AUTHORITATIVE if applicable        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ COMMIT + PR                                                 │
│  → git commit with conventional message                     │
│  → git push origin develop                                  │
│  → Raise PR: develop → main (or preview → develop)          │
│  → Produce SESSION OBSERVATION BLOCK                        │
└─────────────────────────────────────────────────────────────┘
```

---

## The Read-First Protocol

Every Claude Code session begins by reading files in this exact order.
No code is written until the SESSION START REPORT is produced.

See `methodology/SESSION_START.md` for the full 9-step protocol.

**The core principle:** Context is never assumed — it is always verified.
The agent proves it has read every relevant file before touching any code.

---

## The Degradation Signal Checklist

Claude Code runs this at every session end. Results go in SESSION_OBSERVATIONS.md.
If any box is checked, it becomes a debt item immediately.

```
- [ ] File size creep — any file > 500 lines?
- [ ] Test count decreased from baseline?
- [ ] New duplicate code introduced?
- [ ] CSS hardcoded hex values (not using CSS variables)?
- [ ] Console.log left in production code?
- [ ] Missing loading states on any new fetch?
- [ ] Mobile not tested (390px viewport)?
- [ ] Light theme broken (dark colors in portal inline styles)?
- [ ] BISXP artifact missing or not updated this session?
- [ ] Principle check not answered at session start?
```

---

## The Session Observations Format

Every session entry in SESSION_OBSERVATIONS.md must follow this format exactly.
Claude Code fills this in at session end. Not optional.

```markdown
## Session [type+number] — [Date]

### Principle served
- Principle N (Name): X/Y → target Z/Y

### Files created/modified
- path/to/file.tsx — [what changed, one line]

### Test health
- Tests passing: X/Y (was N at session start)
- New tests added: N
- Tests removed: N (reason if any)

### Debt introduced
- DEBT-NNN: [description] — P[1/2/3]

### Debt resolved
- DEBT-NNN: [description] — commit [hash]

### Degradation signals
- [ ] File size creep (any file > 500 lines?)
- [ ] Test count decreased?
- [ ] New duplicate code introduced?
- [ ] CSS hardcoded hex values?
- [ ] Console.log left in production code?
- [ ] Missing loading states?
- [ ] Mobile not tested?
- [ ] Light theme broken in portals?
- [ ] BISXP artifact not updated?
- [ ] Principle check not answered?

### Principle scores after this session
| Principle | Before | After |
|-----------|--------|-------|
| N. Name   | X/Y    | Z/Y   |

### Suggestions for next session
- [concrete suggestion 1]
- [concrete suggestion 2]
```

---

## The TECHNICAL_DEBT.md Format

Every debt item follows this format:

```markdown
**DEBT-NNN: [Title]**
Introduced: [session] | Effort: [time] | Priority: P[1/2/3] | Planned: [session]
[One paragraph describing the problem, root cause, and fix.]
```

Resolved items move to the Resolved section:

```markdown
**DEBT-RNN: [Title]** ✅
Resolved: [session] | Commit: [hash] | Date: [date]
[One line describing what was done.]
```

---

## Anti-Rationalization Tables

Agents will skip steps. These are the most common excuses and the rebuttals.
When you find yourself thinking any of these, stop. The rebuttal is correct.

### Build-time excuses

| Excuse | Rebuttal |
|---|---|
| "I'll add tests after" | Tests accompany implementation, always. "After" never comes. |
| "It's a small change, tsc isn't needed" | tsc catches bugs the eye misses. Always run it. |
| "The skill is DRAFT but the code looks right" | DRAFT means unproven. Treat as spec, not reference. |
| "select('*') is fine, RLS handles it" | RLS can be misconfigured. Explicit columns are the contract. |
| "I'll update CLAUDE_CONTEXT.md at the end" | You will forget. Update as you go. |
| "The file is only 520 lines, I'll split it later" | 500 is a hard rule. Split now or the session doesn't ship. |
| "I don't need to read CLAUDE_CONTEXT.md, I remember" | You don't. The context has drifted. Read it. |

### Session-boundary excuses

| Excuse | Rebuttal |
|---|---|
| "This is a small patch, no FEATURE.md needed" | Use PATCH_TEMPLATE.md. The template is the gate. |
| "I'll just make this one extra fix" | Scope creep. One session = one feature. Log it as a new debt item. |
| "The tests are slow, I'll skip them this once" | Slow tests find real bugs. Run them every time. |
| "I'll skip SESSION_OBSERVATIONS.md, nothing changed" | Something always changed. That's why we run the checklist. |
| "The principle check doesn't apply here" | It always applies. Answer it or don't start. |

### Skill-building excuses

| Excuse | Rebuttal |
|---|---|
| "I'll promote the skill after one more test" | Don't. Promote after it's in production with edge cases handled. |
| "I can update the skill from memory" | You can't. Read it first. Compare against the implementation. |
| "The skill checklist is long, I'll trim it" | The checklist is the contract. Trim it and the skill stops being authoritative. |

---

## Non-Negotiable Rules

These apply to every session, every time. No exceptions.

1. **FEATURE.md before code.** No feature work begins without an approved FEATURE.md.
2. **Artifact check before anything.** Claude Code flags missing artifacts and stops.
3. **Principle check before planning.** No FEATURE.md written without answering the three questions.
4. **R-sessions before S-sessions.** P1 debt is cleared before new features.
5. **Tests must grow.** Every PR maintains or increases the test count.
6. **500-line file limit.** Files over 500 lines are split before merge.
7. **Light theme in portals.** Never set dark body background in portal inline styles.
8. **CSS variables only.** No hardcoded hex colors anywhere.
9. **Mobile first.** Every UI change works on 390px before desktop.
10. **Docs updated every session.** CLAUDE_CONTEXT.md, SESSION_OBSERVATIONS.md, TECHNICAL_DEBT.md — all updated before the PR is raised.

### Escape Hatches (from SESSION_CONTRACT.md — verbatim)

These are the only cases where the FEATURE.md gate can be skipped:

**1. Bug Fix**
- **When:** Production bug that needs immediate fix
- **Rule:** Commit prefix `fix:`, tests required, PR still required
- **Skip:** FEATURE.md not needed (use PATCH_TEMPLATE.md)

**2. Test-Only**
- **When:** Adding tests for existing code, no behavior change
- **Rule:** Commit prefix `test:`, no app code changes
- **Skip:** FEATURE.md not needed

**3. Hotfix**
- **When:** Critical production issue (site down, data loss, security)
- **Rule:** Can push directly to `main` if necessary, but must open a follow-up PR documenting the change
- **Skip:** FEATURE.md and PR can be retroactive

**4. Docs/CI Only**
- **When:** Documentation updates, CI pipeline changes, config files
- **Rule:** Commit prefix `docs:` or `ci:`, no app code changes
- **Skip:** FEATURE.md not needed

---

## Claude.ai Guardrail Checks

At the start of every Claude.ai planning conversation, check:

### Artifact Check
Are all seven BISXP artifacts present in the repo?
If any are missing: "BISXP METHODOLOGY VIOLATION — [artifact] is missing.
Per bisxp.com/method, this is required before any session work begins."

### Priority Check
Before planning any session, confirm:
1. Are all P1 debt items resolved? If not, plan an R-session first.
2. Are all BISXP artifacts present? If not, plan the methodology session first.
3. What is the lowest-scoring marketplace principle? Plan the next S-session for that.

### Principle Check
Before writing any FEATURE.md:
1. Which principle does this session serve?
2. What is the current audit score?
3. Is there a lower-scoring principle we should fix first?

If question 3 answer is yes: "Before we plan [session X], note that
Principle [N] scores [Y/Z] which is lower than [session X]'s principle.
Should we address that first?"

### Scope Check
Before writing any instruction widget:
- Is the session scope bounded to one principle?
- Is the FEATURE.md zero-ambiguity?
- Does the session end with updated docs, not just code?
- Is the file size rule (500 lines) going to be maintained?

---

## What Success Looks Like

When the methodology is working correctly, every session looks like this:

1. Claude.ai opens with the principle check answered
2. The FEATURE.md is zero-ambiguity before Claude Code is invoked
3. Claude Code's first action is the artifact check — it either passes or flags
4. The session delivers exactly what the FEATURE.md scoped — nothing more
5. The session ends with all four docs updated and a PR raised
6. The investigation report scores move — even by one question
7. The next session's principle check is informed by what just happened

When this is the rhythm, the codebase compounds. Each session makes the
next one faster, more reliable, and more aligned with what the marketplace
actually needs to work.

---

_This document is the architectural source of truth for all BISXP projects._
_Per-project state lives in each project's CLAUDE_CONTEXT.md and [PROJECT]_METHODOLOGY.md._
_When they conflict, this document takes precedence on methodology questions._
_When they conflict on technical implementation, the project's CLAUDE_CONTEXT.md wins._
