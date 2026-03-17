# Draft Two-Grid Ranking Page Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-grid draft ranking page with a two-grid layout — an Explore Grid for browsing all players and a Rank Grid for ordering your draft preferences — so exploration and ranking are physically separated and rankings can't be accidentally destroyed.

**Architecture:** Two AG Grid instances in `DraftContainer` sharing React state. `allPlayers[]` is immutable server data. `rankings[]` is the ordered list of ranked player IDs that the Rank Grid displays and mutates. The Explore Grid reads both to show rank numbers and dim ranked players. CSV import seeds the rankings array. Submit persists to Supabase.

**Tech Stack:** AG Grid Community (already installed), Next.js 15, React 19, @supabase/ssr, CSS Modules

**Spec:** `docs/superpowers/specs/2026-03-17-draft-two-grid-design.md`

---

## File Map

### Files to Create
- `src/components/explore-grid/explore-grid.tsx` — Explore Grid: all players, sort/filter, checkbox select, shows rank status
- `src/components/explore-grid/explore-grid.module.css` — Explore Grid styles
- `src/components/rank-grid/rank-grid.tsx` — Rank Grid: compact draft board, drag-to-reorder, remove button
- `src/components/rank-grid/rank-grid.module.css` — Rank Grid styles

### Files to Modify
- `src/app/pool/[pool_id]/draft/[draft_num]/page.tsx` — Pass full player list + existing rankings as separate props
- `src/components/draft-container/draft-container.tsx` — Complete rewrite: two-grid layout, shared state, CSV integration, sticky submit banner
- `src/components/draft-container/draft-container.module.css` — Two-column layout, toolbar, sticky banner, responsive

### Files to Remove (after migration complete)
- `src/components/draft-grid/draft-grid.tsx` — Replaced by explore-grid + rank-grid
- `src/components/draft-grid/draft-grid.module.css` — Replaced
- `src/components/draft-grid/__tests__/draft-grid.test.tsx` — Replaced by new tests
- `src/components/mode-toggle/mode-toggle.tsx` — No longer needed
- `src/components/mode-toggle/mode-toggle.module.css` — No longer needed

### Existing Files to Keep (unchanged)
- `src/components/upload-button/upload-button.tsx` — CSV upload, reused as-is
- `src/components/download-button/download-button.tsx` — CSV download, reused as-is
- `src/components/data-grid/theme.ts` — AG Grid theme, shared by both grids
- `src/components/data-grid/data-grid.module.css` — AG Grid reset styles, inherited by both grids

---

## Chunk 1: Server Page + Data Layer

Update the draft page server component to pass full player data and existing rankings as separate props. This is the foundation — the new DraftContainer needs all players regardless of whether rankings exist.

### Task 1: Update the draft page to pass all players

**Files:**
- Modify: `src/app/pool/[pool_id]/draft/[draft_num]/page.tsx`

- [ ] **Step 1: Read the current page component**

Read `src/app/pool/[pool_id]/draft/[draft_num]/page.tsx` to understand the current data fetching.

- [ ] **Step 2: Update DraftContainer props**

The page currently passes `csv`, `allDraftablePlayers` (a lookup map), and `existingRankings`. Change it to pass:
- `allPlayers` — the full `available_players_data` array (not just a lookup map)
- `existingRankings` — unchanged
- `csv` — unchanged (still needed for CSV download template)
- `pool_id`, `draft_num`, `roster_id` — unchanged

```typescript
// Replace the allDraftablePlayers lookup map with the full player array
return (
  <>
    <DraftContainer
      pool_id={pool_id}
      draft_num={draft_num}
      roster_id={roster_id}
      csv={csv}
      allPlayers={available_players_data ?? []}
      existingRankings={ranking_data}
    />
  </>
);
```

Remove the `allDraftablePlayers` object creation (the `Object.fromEntries` block). The new components will derive that from the `allPlayers` array.

Also remove the `<h1>Draft {draft_num} Rankings</h1>` — the DraftContainer will render its own header.

- [ ] **Step 3: Verify the build compiles**

Run: `npm run build`
This will fail because DraftContainer's props changed — that's expected and will be fixed in Chunk 2.

- [ ] **Step 4: Commit**

```bash
git add src/app/pool/\[pool_id\]/draft/\[draft_num\]/page.tsx
git commit -m "refactor: pass full player array to DraftContainer"
```

---

## Chunk 2: Rank Grid Component

Build the Rank Grid — the compact draft board with drag-to-reorder and remove functionality.

### Task 2: Create the Rank Grid component

**Files:**
- Create: `src/components/rank-grid/rank-grid.tsx`
- Create: `src/components/rank-grid/rank-grid.module.css`

- [ ] **Step 1: Create rank-grid.module.css**

```css
/* ABOUTME: Styles for the Rank Grid draft board */
/* ABOUTME: Compact drag-to-reorder grid with remove buttons */
.container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.count {
  font-size: 1.3rem;
  color: var(--color-text-muted);
}

.gridWrapper {
  height: 500px;
  width: 100%;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius);
  overflow: hidden;
}

.emptyState {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  border: 2px dashed var(--color-border-subtle);
  border-radius: var(--radius);
  color: var(--color-text-muted);
  font-size: 1.4rem;
  text-align: center;
  padding: 2rem;
}

.removeButton {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 1.4rem;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
}

.removeButton:hover {
  color: var(--color-accent-primary);
  background: none;
}

.highlighted {
  animation: highlightFade 2s ease-out;
}

@keyframes highlightFade {
  0% { background-color: rgba(196, 69, 54, 0.15); }
  100% { background-color: transparent; }
}
```

- [ ] **Step 2: Create rank-grid.tsx**

```typescript
// ABOUTME: Compact draft board grid with drag-to-reorder and remove functionality
// ABOUTME: Displays ranked players in order, supports reordering via row dragging
'use client';

import { useCallback, useMemo, useRef } from 'react';
import { AgGridReact, AgGridProvider } from 'ag-grid-react';
import {
  AllCommunityModule,
  type ColDef,
  type RowDragEndEvent,
  type ICellRendererParams,
} from 'ag-grid-community';
import { inkAndPaperTheme } from '@components/data-grid/theme';
import styles from './rank-grid.module.css';

const modules = [AllCommunityModule];

export interface RankedPlayer {
  player_unique: string;
  player_name: string;
  team_name: string;
  seed: number | null;
  ranking: number;
}

interface RankGridProps {
  players: RankedPlayer[];
  onReorder: (reordered: RankedPlayer[]) => void;
  onRemove: (player_unique: string) => void;
  onPlayerClick?: (player_unique: string) => void;
  highlightedIds?: Set<string>;
}

export function RankGrid({
  players,
  onReorder,
  onRemove,
  onPlayerClick,
  highlightedIds,
}: RankGridProps) {
  const gridRef = useRef<AgGridReact<RankedPlayer>>(null);
  const theme = useMemo(() => inkAndPaperTheme, []);

  const RemoveCellRenderer = useCallback((params: ICellRendererParams<RankedPlayer>) => {
    if (!params.data) return null;
    return (
      <button
        className={styles.removeButton}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(params.data!.player_unique);
        }}
        title="Remove from rankings"
      >
        ✕
      </button>
    );
  }, [onRemove]);

  const columnDefs = useMemo<ColDef<RankedPlayer>[]>(() => [
    { field: 'ranking', headerName: '#', width: 60, rowDrag: true, sortable: false },
    {
      field: 'player_name',
      headerName: 'Player',
      flex: 2,
      sortable: false,
      cellStyle: { cursor: 'pointer' },
      onCellClicked: (params) => {
        if (params.data && onPlayerClick) {
          onPlayerClick(params.data.player_unique);
        }
      },
    },
    { field: 'team_name', headerName: 'Team', flex: 1, sortable: false },
    { field: 'seed', headerName: 'Seed', width: 70, sortable: false },
    {
      headerName: '',
      width: 50,
      sortable: false,
      filter: false,
      resizable: false,
      cellRenderer: RemoveCellRenderer,
    },
  ], [RemoveCellRenderer, onPlayerClick]);

  const onRowDragEnd = useCallback((event: RowDragEndEvent<RankedPlayer>) => {
    const api = gridRef.current?.api;
    if (!api) return;

    const reordered: RankedPlayer[] = [];
    api.forEachNodeAfterFilterAndSort((node, index) => {
      if (node.data) {
        reordered.push({ ...node.data, ranking: index + 1 });
      }
    });
    onReorder(reordered);
  }, [onReorder]);

  const getRowClass = useCallback((params: { data?: RankedPlayer }) => {
    if (params.data && highlightedIds?.has(params.data.player_unique)) {
      return styles.highlighted;
    }
    return undefined;
  }, [highlightedIds]);

  if (players.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Your Rankings</h3>
        </div>
        <div className={styles.emptyState}>
          Select players from the explore grid to start building your draft board.
        </div>
      </div>
    );
  }

  return (
    <AgGridProvider modules={modules}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Your Rankings</h3>
          <span className={styles.count}>{players.length} players</span>
        </div>
        <div className={styles.gridWrapper}>
          <AgGridReact<RankedPlayer>
            ref={gridRef}
            theme={theme}
            columnDefs={columnDefs}
            rowData={players}
            rowDragManaged
            onRowDragEnd={onRowDragEnd}
            getRowId={(params) => params.data.player_unique}
            getRowClass={getRowClass}
            headerHeight={40}
            rowHeight={36}
            defaultColDef={{ resizable: false }}
          />
        </div>
      </div>
    </AgGridProvider>
  );
}
```

- [ ] **Step 3: Verify the component compiles**

Run: `npx tsc --noEmit`
Should pass (component isn't mounted yet, but types should check)

- [ ] **Step 4: Commit**

```bash
git add src/components/rank-grid/
git commit -m "feat: add RankGrid component with drag-to-reorder and remove"
```

---

## Chunk 3: Explore Grid Component

Build the Explore Grid — the full-featured player browser with sort/filter, checkbox selection, and rank display.

### Task 3: Create the Explore Grid component

**Files:**
- Create: `src/components/explore-grid/explore-grid.tsx`
- Create: `src/components/explore-grid/explore-grid.module.css`

- [ ] **Step 1: Create explore-grid.module.css**

```css
/* ABOUTME: Styles for the Explore Grid player browser */
/* ABOUTME: Full-featured grid with selection toolbar and dimmed ranked rows */
.container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.addButton {
  font-family: var(--font-body);
  font-size: 1.3rem;
  font-weight: 700;
  padding: 0.5rem 1.2rem;
  background-color: var(--color-accent-primary);
  color: var(--color-bg-surface);
  border: 2px solid var(--color-accent-primary);
  border-radius: var(--radius);
  cursor: pointer;
}

.addButton:hover {
  background-color: var(--color-link-hover);
  border-color: var(--color-link-hover);
  color: var(--color-bg-surface);
}

.gridWrapper {
  height: 500px;
  width: 100%;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius);
  overflow: hidden;
}
```

- [ ] **Step 2: Create explore-grid.tsx**

The Explore Grid receives all players and a set of ranked player IDs. It shows a rank column (number or "—"), dims ranked rows, supports checkbox multi-select, and fires callbacks for adding players.

```typescript
// ABOUTME: Player browser grid with sort, filter, and selection for adding to rankings
// ABOUTME: Shows all draftable players with rank status, dimmed styling for already-ranked players
'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { AgGridReact, AgGridProvider } from 'ag-grid-react';
import {
  AllCommunityModule,
  type ColDef,
  type RowClassParams,
  type SelectionChangedEvent,
  type RowDoubleClickedEvent,
} from 'ag-grid-community';
import { inkAndPaperTheme } from '@components/data-grid/theme';
import styles from './explore-grid.module.css';

const modules = [AllCommunityModule];

export interface ExplorePlayer {
  player_unique: string;
  player_name: string;
  team_name: string;
  seed: number | null;
  region: string | null;
  tournament_points: number | null;
  points: number | null;
  overall_seed: number | null;
}

interface ExploreGridProps {
  players: ExplorePlayer[];
  rankedPlayerMap: Map<string, number>;
  onAddPlayers: (player_uniques: string[]) => void;
  highlightedId?: string | null;
}

export function ExploreGrid({
  players,
  rankedPlayerMap,
  onAddPlayers,
  highlightedId,
}: ExploreGridProps) {
  const gridRef = useRef<AgGridReact<ExplorePlayer>>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const theme = useMemo(() => inkAndPaperTheme, []);

  const columnDefs = useMemo<ColDef<ExplorePlayer>[]>(() => [
    {
      headerName: 'Rank',
      width: 80,
      valueGetter: (params) => {
        if (!params.data) return null;
        const rank = rankedPlayerMap.get(params.data.player_unique);
        return rank ?? '—';
      },
      sortable: true,
    },
    { field: 'player_name', headerName: 'Player', flex: 2, filter: 'agTextColumnFilter' },
    { field: 'team_name', headerName: 'Team', flex: 1, filter: 'agTextColumnFilter' },
    { field: 'seed', headerName: 'Seed', width: 80 },
    { field: 'region', headerName: 'Region', flex: 1, filter: 'agTextColumnFilter' },
    { field: 'tournament_points', headerName: 'Tourn. Pts', width: 110 },
    { field: 'points', headerName: 'Reg. Pts', width: 100 },
  ], [rankedPlayerMap]);

  const getRowStyle = useCallback((params: RowClassParams<ExplorePlayer>) => {
    if (params.data && rankedPlayerMap.has(params.data.player_unique)) {
      return { color: 'var(--color-text-muted)', opacity: '0.6' };
    }
    return undefined;
  }, [rankedPlayerMap]);

  const onSelectionChanged = useCallback((event: SelectionChangedEvent<ExplorePlayer>) => {
    const selected = event.api.getSelectedRows();
    const unrankedSelected = selected.filter(
      (p) => !rankedPlayerMap.has(p.player_unique)
    );
    setSelectedCount(unrankedSelected.length);
  }, [rankedPlayerMap]);

  const handleAddSelected = useCallback(() => {
    const api = gridRef.current?.api;
    if (!api) return;
    const selected = api.getSelectedRows();
    const unranked = selected
      .filter((p) => !rankedPlayerMap.has(p.player_unique))
      .map((p) => p.player_unique);
    if (unranked.length > 0) {
      onAddPlayers(unranked);
      api.deselectAll();
      setSelectedCount(0);
    }
  }, [rankedPlayerMap, onAddPlayers]);

  const onRowDoubleClicked = useCallback((event: RowDoubleClickedEvent<ExplorePlayer>) => {
    if (event.data && !rankedPlayerMap.has(event.data.player_unique)) {
      onAddPlayers([event.data.player_unique]);
    }
  }, [rankedPlayerMap, onAddPlayers]);

  // Scroll to highlighted player when it changes
  useMemo(() => {
    if (highlightedId && gridRef.current?.api) {
      const node = gridRef.current.api.getRowNode(highlightedId);
      if (node) {
        gridRef.current.api.ensureNodeVisible(node, 'middle');
        gridRef.current.api.flashCells({ rowNodes: [node] });
      }
    }
  }, [highlightedId]);

  return (
    <AgGridProvider modules={modules}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>All Players</h3>
          {selectedCount > 0 && (
            <button className={styles.addButton} onClick={handleAddSelected}>
              Add {selectedCount} player{selectedCount !== 1 ? 's' : ''}
            </button>
          )}
        </div>
        <div className={styles.gridWrapper}>
          <AgGridReact<ExplorePlayer>
            ref={gridRef}
            theme={theme}
            columnDefs={columnDefs}
            rowData={players}
            defaultColDef={{
              sortable: true,
              resizable: true,
              filter: true,
            }}
            rowSelection="multiple"
            onSelectionChanged={onSelectionChanged}
            onRowDoubleClicked={onRowDoubleClicked}
            getRowId={(params) => params.data.player_unique}
            getRowStyle={getRowStyle}
            headerHeight={40}
          />
        </div>
      </div>
    </AgGridProvider>
  );
}
```

Note: Check the AG Grid v35 API for `rowSelection` — it may use `rowSelection={{ mode: 'multiRow', checkboxes: true }}` instead of `rowSelection="multiple"`. Consult docs via context7 if the build fails.

- [ ] **Step 3: Verify the component compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/components/explore-grid/
git commit -m "feat: add ExploreGrid component with sort, filter, and selection"
```

---

## Chunk 4: DraftContainer Rewrite

Rewrite the DraftContainer to orchestrate both grids, manage shared state, handle CSV import/export, and provide the sticky submit banner.

### Task 4: Rewrite DraftContainer with two-grid layout

**Files:**
- Modify: `src/components/draft-container/draft-container.tsx`
- Modify: `src/components/draft-container/draft-container.module.css`

- [ ] **Step 1: Rewrite draft-container.module.css**

```css
/* ABOUTME: Layout and styling for the two-grid draft ranking container */
/* ABOUTME: Side-by-side grids on desktop, stacked on mobile, with sticky submit banner */
.page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.pageHeader h1 {
  text-align: left;
  margin: 0;
}

.toolbar {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.toolbar button {
  font-family: var(--font-body);
  font-size: 1.4rem;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  border: 2px solid var(--color-border-primary);
  border-radius: var(--radius);
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  cursor: pointer;
}

.toolbar button:hover {
  background-color: var(--color-accent-primary);
  color: var(--color-bg-surface);
  border-color: var(--color-accent-primary);
}

.gridLayout {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 1.5rem;
  min-height: 500px;
}

@media (max-width: 768px) {
  .gridLayout {
    grid-template-columns: 1fr;
  }

  .rankPanel {
    order: -1;
  }
}

.stickyBanner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 2rem;
  background: var(--color-bg-surface);
  border-top: 2px solid var(--color-accent-primary);
  z-index: 50;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.bannerText {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.submitButton {
  font-family: var(--font-body);
  font-size: 1.4rem;
  font-weight: 700;
  padding: 0.6rem 2rem;
  background-color: var(--color-accent-primary);
  color: var(--color-bg-surface);
  border: 2px solid var(--color-accent-primary);
  border-radius: var(--radius);
  cursor: pointer;
}

.submitButton:hover {
  background-color: var(--color-link-hover);
  border-color: var(--color-link-hover);
  color: var(--color-bg-surface);
}

.submitButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

- [ ] **Step 2: Rewrite draft-container.tsx**

This is the main orchestration component. It manages the shared state between both grids, handles CSV import/export, and the submit flow.

Key data flow:
- `allPlayers` from server → transformed into `ExplorePlayer[]` for the Explore Grid
- `existingRankings` from server → initial `rankings` state as `RankedPlayer[]`
- `rankings` state → drives the Rank Grid and feeds rank info back to Explore Grid
- CSV upload → replaces `rankings` state
- Submit → upserts `rankings` to Supabase

The component should:
1. Transform server data into the shapes both grids expect
2. Maintain `rankings` as the source of truth
3. Derive a `rankedPlayerMap` (Map<player_unique, rank_number>) for the Explore Grid
4. Handle add, remove, reorder, CSV upload operations
5. Show sticky submit banner when unsaved changes exist

Write the full component. Key interfaces:

```typescript
interface DraftContainerProps {
  pool_id: number;
  draft_num: number;
  roster_id: number;
  csv?: string;
  allPlayers: ViewPoolPlayersFullRow[];
  existingRankings?: RankingFullViewRow[] | null;
}
```

The `allPlayers` array needs to be transformed into `ExplorePlayer[]` by extracting the relevant fields. The `existingRankings` array needs to be sorted by ranking and transformed into `RankedPlayer[]`.

When adding players from Explore → Rank:
1. Look up the full player data from `allPlayers`
2. Assign the next ranking numbers
3. Append to `rankings` state
4. Track newly-added IDs for highlight animation

When removing from Rank:
1. Filter the player out of `rankings`
2. Re-number remaining rankings sequentially

When reordering in Rank:
1. Replace `rankings` with the reordered array (already re-numbered by RankGrid)

When CSV is uploaded:
1. If rankings exist, confirm replacement
2. Parse uploaded data into `RankedPlayer[]`
3. Replace `rankings` state

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: Build succeeds. The draft page should render with both grids.

- [ ] **Step 4: Test manually**

Run: `npm run dev`
Navigate to a draft page. Verify:
1. Explore Grid shows all players
2. Rank Grid shows existing rankings (or empty state)
3. Double-click adds a player to Rank Grid
4. Checkbox select + Add button works
5. Drag-to-reorder works in Rank Grid
6. X button removes from Rank Grid
7. CSV download/upload works
8. Sticky banner appears on changes
9. Submit persists to Supabase

- [ ] **Step 5: Commit**

```bash
git add src/components/draft-container/
git commit -m "feat: rewrite DraftContainer with two-grid layout"
```

---

## Chunk 5: Cleanup and Polish

Remove old components, update tests, and verify everything works end-to-end.

### Task 5: Remove old components and update tests

**Files:**
- Delete: `src/components/draft-grid/`
- Delete: `src/components/mode-toggle/`
- Modify: any files that import from deleted modules

- [ ] **Step 1: Check for remaining imports of old components**

```bash
grep -rn "draft-grid\|mode-toggle\|DraftGrid\|ModeToggle" src/ --include="*.tsx" --include="*.ts"
```

Remove any remaining imports. The DraftContainer rewrite in Chunk 4 should have already removed these imports.

- [ ] **Step 2: Delete old components**

```bash
rm -rf src/components/draft-grid/
rm -rf src/components/mode-toggle/
```

- [ ] **Step 3: Run build to verify nothing breaks**

Run: `npm run build`
Expected: Clean build

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: All tests pass (old draft-grid tests are removed, data-grid tests still pass)

- [ ] **Step 5: Responsive testing**

Run: `npm run dev`
Test at different viewport widths:
- Desktop (>768px): side-by-side layout, Explore 60% / Rank 40%
- Mobile (≤768px): stacked, Rank Grid on top

- [ ] **Step 6: Final commit**

```bash
git add -A  # After reviewing git status
git commit -m "chore: remove old draft-grid and mode-toggle components"
```

- [ ] **Step 7: Push and open PR**

```bash
git push -u origin staff/draft-two-grid
gh pr create --title "feat: two-grid draft ranking page" --body "$(cat <<'EOF'
## Summary
- Replace single-grid draft page with two-grid layout
- Explore Grid: all players with sort/filter/search and checkbox selection
- Rank Grid: compact draft board with drag-to-reorder and remove
- Players move from Explore → Rank via select+add, double-click
- CSV template download and upload remain prominent in toolbar
- Sticky submit banner for unsaved changes
- Responsive: side-by-side on desktop, stacked on mobile

## Test plan
- [ ] Explore Grid shows all draftable players with stats
- [ ] Ranked players appear dimmed in Explore Grid
- [ ] Double-click adds unranked player to Rank Grid
- [ ] Checkbox multi-select + Add button works
- [ ] Drag-to-reorder in Rank Grid updates rankings
- [ ] X button removes player from Rank Grid
- [ ] CSV download exports all players with ranking column
- [ ] CSV upload populates Rank Grid
- [ ] Submit persists rankings to Supabase
- [ ] Sticky banner shows for unsaved changes
- [ ] Responsive layout works on mobile

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
