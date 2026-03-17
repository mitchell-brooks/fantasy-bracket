# Draft Ranking Page — Two-Grid Redesign

## Context

The draft ranking page lets users set their player draft preferences before the tournament. The current implementation shows an AG Grid only when rankings already exist or a CSV has been uploaded, making it hard for new users to get started. Sorting in "browse mode" risks destroying manually-set rankings. The CSV workflow is front-and-center but there's no visual ranking interface for users who don't want to use spreadsheets.

## Goals

1. Always show all draftable players — no blank state
2. Separate exploration (sorting, filtering, comparing stats) from ranking (ordered list)
3. Prevent accidental ranking destruction from column sorts
4. Make the in-app ranking interface the primary workflow, with CSV as a prominent secondary option
5. Clear unsaved state — users know when rankings are submitted vs. pending

## Non-Goals

- Real-time collaborative drafting (future feature)
- Auto-draft from this interface (handled by the pipeline)
- Mobile-native drag-and-drop optimization (responsive web is sufficient)

---

## Architecture

Two coordinated AG Grid instances sharing a single React state in `DraftContainer`.

### State Model

```typescript
// DraftContainer state
allPlayers: DraftPlayer[]        // All draftable players (from server, immutable)
rankings: RankedPlayer[]         // Ordered list of ranked players (source of truth)
hasUnsavedChanges: boolean       // Dirty flag for submit flow
```

The Explore Grid reads from both `allPlayers` and `rankings` to determine which players are ranked and what their rank numbers are. The Rank Grid displays and mutates `rankings`.

### Data Flow

```
Server: all players + existing rankings
    ↓
DraftContainer state: { allPlayers[], rankings[] }
    ↓                        ↓
Explore Grid (read)    Rank Grid (read/write)
    ↓                        ↓
User actions ──────→ state updates
    ↓
Submit → Supabase upsert
```

---

## Layout

### Desktop (>768px)

```
┌──────────────────────────────────────────────────────────┐
│  Draft 1 Rankings                                        │
│  [Download Template]  [Upload Rankings]                  │
├───────────────────────────────┬──────────────────────────┤
│                               │                          │
│  Explore Grid (60%)           │  Rank Grid (40%)         │
│  All players, full stats      │  Compact draft board     │
│  Sort/filter/search           │  Drag to reorder         │
│  Checkbox multi-select        │  X to remove             │
│                               │                          │
├───────────────────────────────┴──────────────────────────┤
│  ⚠ You have unsaved rankings              [Submit]       │
└──────────────────────────────────────────────────────────┘
```

### Mobile (≤768px)

Stacked vertically — Rank Grid on top (primary action), Explore Grid below.

---

## Explore Grid (Left Panel)

**Columns:** Checkbox (select), Rank (# if ranked, "—" if not), Player Name, Team, Seed, Region, Tournament Pts, Regular Season Pts

**Behavior:**
- Full sort and filter on all columns
- Ranked players: dimmed row style (muted text), rank number shown
- Unranked players: normal styling, rank column shows "—"
- Checkbox column for multi-select
- "Add to Rankings" button appears above the grid when 1+ rows selected — shows count ("Add 3 players")
- Double-click an unranked row to quick-add to bottom of Rank Grid
- Double-clicking an already-ranked row does nothing

**Grid dimensions:** 60% width on desktop, full width on mobile

---

## Rank Grid (Right Panel)

**Columns:** Rank # (with drag handle), Player Name, Team, Seed, Remove (X button)

**Behavior:**
- Always sorted by rank — no sort/filter controls
- Drag-to-reorder updates rank numbers automatically
- X button removes player from rankings (un-dims them in Explore Grid)
- Newly added players append at bottom with brief highlight (2-3 second fade)
- Click a player name to scroll to and highlight that row in the Explore Grid

**Grid dimensions:** 40% width on desktop, full width on mobile (appears first/top on mobile)

---

## Player Movement: Explore → Rank

Three mechanisms:
1. **Checkbox select + "Add to Rankings" button** — Select multiple players, click button, they append to bottom of Rank Grid in the order they appeared in the Explore Grid
2. **Double-click** — Quick-add a single player to bottom of Rank Grid
3. **Cross-grid drag** (if AG Grid Community supports it) — Drag selected rows from Explore into Rank Grid at a specific position. Implement only if the API supports it; if not, mechanisms 1 and 2 are sufficient.

Newly added players get the next sequential rank numbers and a brief highlight animation.

## Player Removal: Rank → Explore

- X button on each Rank Grid row
- Player disappears from Rank Grid
- Player becomes un-dimmed in Explore Grid
- Remaining rankings re-number automatically

---

## CSV Import/Export

**Placement:** Toolbar area between the page header and the grids. Prominent, not hidden.

**Download Template:** Exports all draftable players with stats and a blank `ranking` column. Users fill in rank numbers in a spreadsheet and re-upload.

**Upload Rankings:**
- Parses the uploaded CSV
- Populates the Rank Grid with players that have a rank value, sorted by rank number
- Players without a rank remain unranked in the Explore Grid
- If the Rank Grid already has rankings, shows confirmation: "This will replace your current rankings. Continue?"
- Marks state as unsaved — user still needs to click Submit to persist
- Post-upload, the grids work normally — user can reorder, add, remove. CSV is just a way to seed the Rank Grid.

---

## Submit Flow

- Sticky bottom banner appears when unsaved changes exist
- Banner content: "You have unsaved rankings" + [Submit Rankings] button
- "Saving..." state on button during save
- Banner disappears after successful save
- Error feedback if save fails
- Submit persists the full `rankings` array to Supabase via upsert on `rosterranking`

---

## Files to Modify

- `src/app/pool/[pool_id]/draft/[draft_num]/page.tsx` — Pass full player list + existing rankings as separate props
- `src/components/draft-container/draft-container.tsx` — New two-grid layout, shared state management, CSV integration
- `src/components/draft-container/draft-container.module.css` — Two-column layout, sticky banner, responsive styles
- `src/components/draft-grid/draft-grid.tsx` — Refactor into two components: `ExploreGrid` and `RankGrid`
- `src/components/draft-grid/draft-grid.module.css` — Updated styles for both grids

### New Files

- `src/components/explore-grid/explore-grid.tsx` — Explore Grid component
- `src/components/explore-grid/explore-grid.module.css` — Explore Grid styles
- `src/components/rank-grid/rank-grid.tsx` — Rank Grid component
- `src/components/rank-grid/rank-grid.module.css` — Rank Grid styles

### Files to Remove

- `src/components/mode-toggle/` — No longer needed (no mode switching)
- `src/components/draft-grid/` — Replaced by explore-grid and rank-grid
