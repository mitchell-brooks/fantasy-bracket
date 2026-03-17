// ABOUTME: Player browser grid with sort, filter, and selection for adding to rankings
// ABOUTME: Shows all draftable players with rank status, dimmed styling for already-ranked players
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

  const rowSelection = useMemo(() => ({
    mode: 'multiRow' as const,
    headerCheckbox: false,
  }), []);

  const columnDefs = useMemo<ColDef<ExplorePlayer>[]>(() => [
    {
      headerName: 'Rank',
      width: 80,
      valueGetter: (params) => {
        if (!params.data) return null;
        const rank = rankedPlayerMap.get(params.data.player_unique);
        return rank ?? null;
      },
      valueFormatter: (params) => {
        if (params.value == null) return '—';
        return String(params.value);
      },
      sortable: true,
    },
    { field: 'player_name', headerName: 'Player', flex: 2, filter: 'agTextColumnFilter' },
    { field: 'team_name', headerName: 'Team', flex: 1, filter: 'agTextColumnFilter' },
    { field: 'seed', headerName: 'Seed', width: 80 },
    { field: 'region', headerName: 'Region', flex: 1, filter: 'agTextColumnFilter' },
    { field: 'tournament_points', headerName: 'Tourn. Pts', width: 110 },
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
