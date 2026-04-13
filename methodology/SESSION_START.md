# Cold Start Protocol — BISXP Projects

Use this when starting a fresh Claude Code session on any BISXP project.

## Reading order

Read these files in this exact sequence before writing any code:

1. CLAUDE.md (project repo .claude/ folder)
   Hard rules for this codebase. CSS variables, stack pins, never-do list.
   STOP if any rule conflicts with what you are about to do.

2. methodology/BISXP_METHODOLOGY.md (bisxp-com repo)
   The operating system. Session types, artifact model, skill lifecycle,
   non-negotiable rules, degradation checklist.

3. methodology/TECHNICAL_DECISIONS.md (bisxp-com repo)
   Why the rules in CLAUDE.md exist. Read before questioning any constraint.

4. methodology/TESTING_STANDARDS.md (bisxp-com repo)
   Test stack, coverage targets, CI pipeline. Know what "tests pass" means.

5. [PROJECT]_METHODOLOGY.md (project repo)
   Project-specific principle scores, session history, ranked plan.
   Example: FETESPACE_METHODOLOGY.md, TABRO_METHODOLOGY.md

6. CLAUDE_CONTEXT.md (project repo)
   Current architecture snapshot. What has been built, how it works.

7. SESSION_OBSERVATIONS.md (project repo — last 3 entries only)
   Degradation signals from recent sessions. If tests decreased or
   tsc failed, this is where it's recorded.

8. TECHNICAL_DEBT.md (project repo)
   Active P1 items. You must not make any of these worse.

9. FEATURE-[session].md (project repo)
   The approved spec for this session. Non-optional.
   If this file does not exist, stop and ask.

10. Skills listed in ## Skills required of the FEATURE.md
    Load only the skills explicitly listed. Not all of them.

## Session start report

After reading, produce this report before writing any code:

---
SESSION START REPORT
Project: [name]
Session: [FEATURE ID and type — R-session | S-session | Patch]
Branch: [git branch]
Baseline: [N tests passing] | tsc [clean | N errors]
Phase: [Define | Plan | Build | Verify | Review | Ship]
Principle served: [Principle N — current score → target]
Skills loaded: [list from ## Skills required]
Skill status: [DRAFT | AUTHORITATIVE for each]
First action: [exact next step from FEATURE.md]
---

## Patch sessions (no FEATURE.md)

For bug fixes and patches, the reading order is shorter:
1. CLAUDE.md
2. BISXP_METHODOLOGY.md (patch section only)
3. CLAUDE_CONTEXT.md
4. TECHNICAL_DEBT.md
Then use PATCH_TEMPLATE.md and proceed.
