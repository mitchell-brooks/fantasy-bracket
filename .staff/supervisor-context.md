# Bracketude Pre-Tournament Improvements — Supervisor Context

## Project Overview

Bracketude is an NCAA tournament fantasy drafting app. You are supervising three parallel workstreams to improve it before the tournament starts.

**Timeline:**
- Today: Selection Sunday — data import happens separately (not your concern)
- Tomorrow (Mon): Users need to submit draft rankings via the site
- Thursday: Tournament starts, scoring pipeline must be ready
- **Ship everything by Wednesday night at the latest**

## Repository

- **Location:** /Users/mlb/code/fantasy-bracket
- **Tech stack:** Next.js 13.2 (upgrading to 15), Supabase, TypeScript, Python 3.9+
- **Design spec:** `docs/superpowers/specs/2026-03-15-pre-tournament-improvements-design.md`

## The Three Workstreams

### WS1: Infrastructure Upgrade
- **Plan:** `docs/superpowers/plans/2026-03-15-ws1-infrastructure.md`
- **Branch:** `staff/ws1-infrastructure`
- **Dependencies:** None — can start immediately
- **Priority:** HIGH — WS2 depends on this being merged first
- **Scope:** Next.js 15 upgrade, Supabase SSR migration, magic link auth, Vitest, strict TypeScript
- **Ship by:** Monday evening

### WS2: UI/UX + Visual Redesign
- **Plan:** `docs/superpowers/plans/2026-03-15-ws2-ui-ux.md`
- **Branch:** `staff/ws2-ui`
- **Dependencies:** WS1 must be merged first
- **Priority:** HIGH — users need the draft interface by Tuesday
- **Scope:** Ink & Paper palette, AG Grid rollout, draft ranking interface (reorder/browse modes), responsive
- **Ship by:** Wednesday

### WS2: Python Data Pipeline
- **Plan:** `docs/superpowers/plans/2026-03-15-ws3-pipeline.md`
- **Branch:** `staff/ws3-pipeline`
- **Dependencies:** None — can start immediately (different language/directory, no conflicts with WS1)
- **Priority:** MEDIUM — must be ready by Thursday when tournament starts
- **Scope:** Extract notebooks → Python modules, CLI, season config TOML files
- **Ship by:** Thursday morning

## Dependency Graph

```
WS1 (Infrastructure) ──┐
                        ├──> WS2 (UI/UX) — starts after WS1 merges
WS3 (Pipeline) ────────┘    (WS3 is fully independent)
```

## Key Decisions Already Made

1. **Visual direction:** "Ink & Paper evolved" — warm parchment background (#f4f1eb), deep red accent (#c44536), forest green for scores (#386641)
2. **AG Grid Community** (free, MIT) replaces react-table
3. **Draft interface:** Two modes — Reorder (drag-and-drop sets rankings) and Browse (sort/filter without affecting rankings)
4. **Auth:** Switch from broken password form to magic link (Supabase OTP)
5. **Pipeline CLI:** `python -m pipeline <command>` with argparse, season config via TOML
6. **Layout:** Drop decorative bracket side columns, go full-width centered content

## What the Boss (Mitchell) Cares About

- Ship something working. Half-finished is worse than unfinished.
- The draft interface is the most user-facing critical path item
- Don't over-engineer — this project gets 2 weeks of attention per year
- Follow TDD per the CLAUDE.md rules
- Commit frequently
- Follow the plans as written — escalate if something doesn't work rather than improvising

## CLAUDE.md Rules to Watch

The repo has a comprehensive CLAUDE.md. Key rules for leads:
- TDD is mandatory — write failing test first
- No `!` (non-null assertions) or `as` (type casts) in TypeScript
- All files must start with ABOUTME comments
- Never delete tests because they're failing
- Commit frequently
- Never skip pre-commit hooks
