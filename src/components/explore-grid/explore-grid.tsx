// ABOUTME: Player browser grid with sort, filter, and selection for adding to rankings
// ABOUTME: Shows all draftable players with rank status, dimmed styling for already-ranked players
'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
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
  note: string | null;
  region: string | null;
  tournament_points: number | null;
  points: number | null;
  overall_seed: number | null;
  position: string | null;
  wins: number | null;
  losses: number | null;
  assists: number | null;
  rebounds: number | null;
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
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(
    () => new Set(['region', 'tournament_points', 'overall_seed', 'position', 'wins', 'losses', 'assists', 'rebounds'])
  );
  const theme = useMemo(() => inkAndPaperTheme, []);
  const rankedPlayerMapRef = useRef(rankedPlayerMap);
  rankedPlayerMapRef.current = rankedPlayerMap;

  const rowSelection = useMemo(() => ({
    mode: 'multiRow' as const,
    headerCheckbox: false,
  }), []);

  // All available columns — hide state driven by hiddenColumns set
  const allColumnDefs = useMemo<Array<ColDef<ExplorePlayer> & { field?: string }>>(() => [
    {
      colId: 'rank',
      headerName: 'Rank',
      headerTooltip: 'Your current ranking for this player',
      width: 80,
      valueGetter: (params) => {
        if (!params.data) return null;
        const rank = rankedPlayerMapRef.current.get(params.data.player_unique);
        return rank ?? null;
      },
      valueFormatter: (params) => {
        if (params.value == null) return '—';
        return String(params.value);
      },
      sortable: true,
    },
    { field: 'player_name', headerName: 'Player', headerTooltip: 'Player Name', flex: 2, filter: 'agTextColumnFilter' },
    { field: 'team_name', headerName: 'Team', headerTooltip: 'Team Name', flex: 1, filter: 'agTextColumnFilter' },
    { field: 'seed', headerName: 'Seed', headerTooltip: 'Tournament Seed', width: 80 },
    { field: 'note', headerName: 'Notes', headerTooltip: 'Injury/eligibility notes', flex: 2, filter: 'agTextColumnFilter', sortable: true },
    { field: 'points', headerName: 'Reg. Pts', headerTooltip: 'Regular Season Points', width: 100 },
    { field: 'position', headerName: 'Pos', headerTooltip: 'Position', width: 70, filter: 'agTextColumnFilter' },
    { field: 'region', headerName: 'Region', headerTooltip: 'Tournament Region', flex: 1, filter: 'agTextColumnFilter' },
    { field: 'tournament_points', headerName: 'Tourn. Pts', headerTooltip: 'Tournament Points', width: 110 },
    { field: 'overall_seed', headerName: 'Overall', headerTooltip: 'Overall Seed', width: 90 },
    { field: 'wins', headerName: 'W', headerTooltip: 'Team Wins', width: 60 },
    { field: 'losses', headerName: 'L', headerTooltip: 'Team Losses', width: 60 },
    { field: 'assists', headerName: 'Ast', headerTooltip: 'Assists Per Game', width: 70 },
    { field: 'rebounds', headerName: 'Reb', headerTooltip: 'Rebounds Per Game', width: 70 },
  ], []);

  const columnDefs = useMemo<ColDef<ExplorePlayer>[]>(
    () => allColumnDefs.map((col) => ({
      ...col,
      hide: col.field ? hiddenColumns.has(col.field) : false,
    })),
    [allColumnDefs, hiddenColumns]
  );

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

  // Refresh rank column and row styles when rankings change
  useEffect(() => {
    const api = gridRef.current?.api;
    if (api) {
      api.refreshCells({ columns: ['0'] });
      api.redrawRows();
    }
  }, [rankedPlayerMap]);

  const toggleColumn = useCallback((field: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  }, []);

  // Scroll to highlighted player when it changes
  useEffect(() => {
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
          <div className={styles.headerActions}>
            {selectedCount > 0 && (
              <button className={styles.addButton} onClick={handleAddSelected}>
                Add {selectedCount} player{selectedCount !== 1 ? 's' : ''}
              </button>
            )}
            <div className={styles.columnPickerWrapper}>
              <button
                className={styles.columnPickerButton}
                onClick={() => setShowColumnPicker((prev) => !prev)}
                title="Show or hide columns"
              >
                Columns
              </button>
              {showColumnPicker && (
                <div className={styles.columnPickerDropdown}>
                  {allColumnDefs.map((col) => {
                    const field = col.field;
                    if (!field) return null;
                    return (
                      <label key={field} className={styles.columnPickerItem}>
                        <input
                          type="checkbox"
                          checked={!hiddenColumns.has(field)}
                          onChange={() => toggleColumn(field)}
                        />
                        {col.headerTooltip ?? col.headerName ?? field}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
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
            tooltipShowDelay={300}
            rowSelection={rowSelection}
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
