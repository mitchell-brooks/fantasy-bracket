# Pre-Tournament Improvements Design

## Context

Bracketude is an NCAA tournament fantasy drafting app. Users create pools, draft players, and compete based on tournament performance. The app runs on Next.js 13.2 with Supabase (PostgreSQL) and uses Python/Jupyter notebooks for data pipeline operations.

Selection Sunday is March 15, 2026. The tournament starts March 19. Users need to interact with the draft interface starting March 16. Scores need to flow into the system starting March 19.

## Goals

1. Modernize the framework and infrastructure (Next.js 15, Supabase SSR SDK, auth fix)
2. Improve the UI/UX with AG Grid, an in-app draft interface, and a visual redesign
3. Harden the Python data pipeline into importable modules with a CLI

## Constraints

- One week timeline with hard deadlines (draft interface usable by March 16, scoring pipeline ready by March 19)
- Site must remain functional throughout — no extended downtime
- ~12 users in the main pool; the system doesn't need to scale beyond that
- Developer picks this project up for ~2 weeks/year — solutions must be easy to resume after 11 months

## Non-Goals

- Real-time Supabase subscriptions (stretch goal for later)
- Fully automated score ingestion from sportsipy (stretch goal)
- Comprehensive test coverage (separate workstream)
- Mobile-native experience (responsive web is sufficient)

---

## Architecture

Three parallel workstreams executed via Staff orchestrator in isolated git worktrees:

| Workstream | Branch | Depends On | Ship By |
|---|---|---|---|
| WS1: Infrastructure | `staff/ws1-infrastructure` | Nothing | March 16 |
| WS2: UI/UX + Visual | `staff/ws2-ui` | WS1 merge | March 18 |
| WS3: Pipeline | `staff/ws3-pipeline` | Nothing | March 19 |

WS1 and WS3 run in parallel from the start. WS2 starts after WS1 merges (needs upgraded framework), though CSS/design work can be prototyped in parallel.

---

## WS1: Infrastructure Upgrade

**Goal**: Modernize the foundation so WS2 can build on current tools. The site should look and behave identically after this workstream merges, except for the auth fix.

### 1.1 Next.js 13.2 → 15.x

- Remove `experimental: { appDir: true }` (stable since 13.4)
- Update `next.config.js` syntax for Next.js 15
- Fix any breaking API changes across the major version jumps (13 → 14 → 15)
- Update `eslint-config-next` to match

### 1.2 Supabase SDK Migration

- Migrate `@supabase/auth-helpers-nextjs` → `@supabase/ssr` (auth-helpers is deprecated)
- Update `supabase-server.ts` and `supabase-browser.ts` to new SSR client patterns
- Update middleware for new Supabase session refresh pattern
- Update `SupabaseProvider` and `SupabaseListener` components

### 1.3 Fix Auth Flow

- Replace the password-pretending-to-be-magic-link with an explicit magic link flow
- Use `@supabase/auth-ui-react` with `magicLink` view, or a simple email-entry form
- Clean up login → profile creation flow
- Ensure logout works cleanly

### 1.4 Remove Hard-Coded Values

- Competition IDs → derive from database queries or route context
- Participant count (hard-coded 9) → query from pool data
- Any other hard-coded values discovered during migration

### 1.5 Add Test Framework

- Install Vitest + React Testing Library
- Configure for Next.js 15 (App Router)
- Add a few smoke tests (app renders, key pages load) — framework in place, not full coverage
- New features in WS2 will be written TDD

### 1.6 Stricter TypeScript

- Enable `noUncheckedIndexedAccess` and `useUnknownInCatchVariables`
- Fix resulting type errors
- Align with CLAUDE.md TypeScript rules (no `!` assertions, no `as` casts)

---

## WS2: UI/UX + Visual Redesign

**Goal**: Modernize the user experience and visual design. This is what users will notice.

### 2.1 Visual Redesign — "Ink & Paper Evolved"

**Palette:**
- Background: warm parchment (`#f4f1eb`)
- Text: dark ink (`#2a2a2a`)
- Accent/leaders: deep red (`#c44536`)
- Positive scoring: forest green (`#386641`)
- Eliminated/inactive: muted gray
- Borders: dark ink, used selectively (section dividers, table headers)
- Paper texture overlay: keep, adjust tint to warm palette

**Typography:**
- Keep TiltWarp for headers (the personality font)
- Keep Quicksand for body text
- No changes to the type scale

**Layout changes:**
- Drop the decorative bracket side columns — go full-width content with a max-width container
- Keep bold black borders as a design element but use more selectively
- Update CSS custom properties in `theme.css` so the whole system shifts via variables

### 2.2 AG Grid Rollout

- Install AG Grid Community (free, MIT license)
- Replace `react-table` across all data tables:
  - Leaderboard page
  - Roster page
  - Team/teams pages
  - Draft results page
- Theme AG Grid to match Ink & Paper palette (custom AG Grid theme)
- Sorting, filtering, column resizing come free from AG Grid

### 2.3 Draft Ranking Interface

**Keep existing CSV upload/download** for power users.

**Add in-app AG Grid-based ranking interface with two modes:**

- **Reorder mode**: AG Grid row dragging enabled. Position in the grid = ranking number. Dragging a row automatically recalculates all ranking numbers. This is the primary "set your draft order" interface.

- **Browse mode**: Standard AG Grid with sorting/filtering on all columns (player stats, team, seed, etc.). Users can explore the data without affecting their rankings. Toggle to reorder mode when ready to act.

**Mode toggle**: Button or tab at the top of the grid.

**Save**: Button to persist rankings to Supabase (writes to `rosterranking` table).

**Validation**: Warn if rankings are incomplete before draft deadline.

### 2.4 Leaderboard Improvements

- AG Grid with sortable columns
- Color-coded position indicators (1st/2nd/3rd get accent color treatment)
- "Trailing" column prominent — this is what people obsess over during the tournament
- Active player count visually distinct (e.g., badge or color)
- Eliminated players clearly marked (strikethrough + muted color)

### 2.5 Responsive

- Without side bracket columns, layout is simpler to make responsive
- AG Grid handles its own responsive behavior
- Target: usable on tablet for draft interface, phone for leaderboard viewing

---

## WS3: Python Data Pipeline

**Goal**: Extract notebook code into importable, parameterized Python modules with a CLI.

### 3.1 Module Structure

```
data/
  pipeline/
    __init__.py
    __main__.py          # CLI entry point (python -m pipeline)
    cli.py               # argparse CLI with --help on every command
    config.py            # Season configuration loader
    supabase_client.py   # Shared Supabase client initialization
    data_loading.py      # Teams, players, rounds, conferences
    game_recording.py    # Schedules, scoring sheets, score updates
    draft.py             # Draft logic, autodraft, roster maintenance
    README.md            # Agent-readable documentation of all commands
  seasons/
    2025.toml            # Season config (competition_id, pool_id, year, etc.)
    2026.toml
  2025/                  # Existing CSV data (unchanged)
  2026/                  # New season data
```

### 3.2 CLI Commands

All commands designed to be discoverable and intuitive for both humans and agents:

```
python -m pipeline --help                    # List all commands
python -m pipeline load-data --season 2026   # Load teams/players/rounds
python -m pipeline generate-scoring-sheet --date 2026-03-20
python -m pipeline record-scores --date 2026-03-20 --round 2
python -m pipeline update-schedule --round 3 --season 2026
python -m pipeline run-draft --pool 19 --draft-num 1
python -m pipeline maintain-rosters --pool 19 --draft-num 2
```

Every command has `--help` with clear descriptions of arguments and behavior.

### 3.3 Season Configuration

`data/seasons/2026.toml`:
```toml
[competition]
id = 7
unique = "ncaambb-d1-championship"
season = "2025-26"
year = 2026
round_count = 7
expected_teams = 68

[pool]
id = 20
name = "March Radness 2026"

[paths]
data_dir = "data/2026"
```

Copy last year's file and update values — easy to resume after 11 months.

### 3.4 Notebooks as Thin Wrappers

Existing notebooks simplified to:
```python
from pipeline import data_loading, config
cfg = config.load("2026")
data_loading.add_teams_to_db(cfg)
```

Notebooks remain for exploratory/one-off use but all logic lives in modules.

### 3.5 Bug Fixes

- `generate_rankings_dict()` append logic that could create duplicate picks
- `update_game_schedule()` missing conflict handling (duplicate games)
- Add CSV existence validation before processing
- Add CSV column validation with clear error messages

### 3.6 Agent Discoverability

- `pipeline/README.md` documents all commands, config format, and typical workflows
- `--help` on every command with examples
- Config file serves as self-documenting reference (agents can read `2025.toml` to understand what `2026.toml` needs)
- Clear error messages that suggest the correct command when something goes wrong

---

## Visual Design Token Reference

For implementation reference, the Ink & Paper palette as CSS custom properties:

```css
:root {
  /* Backgrounds */
  --bg-primary: #f4f1eb;
  --bg-surface: #faf8f4;
  --bg-overlay: #f4f1eb;    /* paper texture tint */

  /* Text */
  --text-primary: #2a2a2a;
  --text-secondary: #666;
  --text-muted: #999;
  --text-eliminated: #aaa;

  /* Accents */
  --accent-primary: #c44536;   /* deep red — leaders, important actions */
  --accent-positive: #386641;  /* forest green — points, gains */
  --accent-neutral: #ddd5c7;   /* warm gray — secondary badges */

  /* Borders */
  --border-primary: #1a1a1a;
  --border-subtle: #d4cfc5;

  /* Typography (unchanged) */
  --font-header: 'TiltWarp', Impact, Helvetica, Arial, serif;
  --font-body: 'Quicksand', Georgia, serif;
}
```

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Next.js upgrade breaks existing functionality | Medium | High | WS1 is isolated; test thoroughly before merging. Keep a rollback branch. |
| AG Grid theming doesn't match design | Low | Medium | AG Grid has extensive theming API; worst case is minor visual inconsistencies |
| WS2 blocked on WS1 taking too long | Medium | High | CSS/design work can be prototyped independently. WS1 scope is deliberately minimal. |
| Merge conflicts between workstreams | Medium | Low | WS1 and WS3 touch completely different files. WS2 waits for WS1. |
| Staff orchestrator hiccups | Medium | Low | Failure mode is manual intervention, not data loss |
| Sportsipy scraping breaks (site changes) | Medium | Medium | Not in critical path — manual CSV workflow remains as fallback |
