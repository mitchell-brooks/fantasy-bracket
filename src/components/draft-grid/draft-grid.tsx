// ABOUTME: AG Grid-based draft ranking interface with two modes
// ABOUTME: Reorder mode: drag rows to set rankings. Browse mode: sort/filter without affecting rankings.
'use client';

import { useCallback, useMemo, useRef } from 'react';
import { AgGridReact, AgGridProvider } from 'ag-grid-react';
import {
  AllCommunityModule,
  type ColDef,
  type RowDragEndEvent,
  themeQuartz,
} from 'ag-grid-community';
import { ModeToggle } from '@components/mode-toggle/mode-toggle';
import styles from './draft-grid.module.css';

const modules = [AllCommunityModule];

const inkAndPaperTheme = themeQuartz.withParams({
  backgroundColor: '#faf8f4',
  foregroundColor: '#2a2a2a',
  borderColor: '#d4cfc5',
  headerBackgroundColor: '#f4f1eb',
  headerFontSize: 14,
  headerFontWeight: 600,
  fontSize: 14,
  rowHoverColor: '#edeae3',
  selectedRowBackgroundColor: '#e8e4dc',
  accentColor: '#c44536',
});

export interface DraftPlayer {
  player_unique: string;
  player_name: string;
  team_name: string;
  seed: number;
  tournament_points: number;
  points: number;
  ranking: number | null;
}

interface DraftGridProps {
  players: DraftPlayer[];
  mode: 'reorder' | 'browse';
  onModeChange: (mode: 'reorder' | 'browse') => void;
  onRankingsChange: (rankings: Array<{ player_unique: string; ranking: number }>) => void;
}

export function DraftGrid({
  players,
  mode,
  onModeChange,
  onRankingsChange,
}: DraftGridProps) {
  const gridRef = useRef<AgGridReact<DraftPlayer>>(null);

  const reorderColumnDefs = useMemo<ColDef<DraftPlayer>[]>(() => [
    { field: 'ranking', headerName: '#', width: 70, rowDrag: true, sortable: false },
    { field: 'player_name', headerName: 'Player', flex: 2 },
    { field: 'team_name', headerName: 'Team', flex: 1 },
    { field: 'seed', headerName: 'Seed', width: 80 },
    { field: 'tournament_points', headerName: 'Tourn. Pts', flex: 1 },
    { field: 'points', headerName: 'Reg. Pts', flex: 1 },
  ], []);

  const browseColumnDefs = useMemo<ColDef<DraftPlayer>[]>(() => [
    { field: 'ranking', headerName: 'Rank', width: 80 },
    { field: 'player_name', headerName: 'Player', flex: 2, filter: 'agTextColumnFilter' },
    { field: 'team_name', headerName: 'Team', flex: 1, filter: 'agTextColumnFilter' },
    { field: 'seed', headerName: 'Seed', width: 80 },
    { field: 'tournament_points', headerName: 'Tourn. Pts', flex: 1 },
    { field: 'points', headerName: 'Reg. Pts', flex: 1 },
  ], []);

  const onRowDragEnd = useCallback((event: RowDragEndEvent<DraftPlayer>) => {
    const api = gridRef.current?.api;
    if (!api) return;

    const updatedRankings: Array<{ player_unique: string; ranking: number }> = [];
    api.forEachNodeAfterFilterAndSort((node, index) => {
      if (node.data) {
        node.data.ranking = index + 1;
        updatedRankings.push({
          player_unique: node.data.player_unique,
          ranking: index + 1,
        });
      }
    });
    api.refreshCells({ columns: ['ranking'] });
    onRankingsChange(updatedRankings);
  }, [onRankingsChange]);

  const theme = useMemo(() => inkAndPaperTheme, []);

  return (
    <AgGridProvider modules={modules}>
      <div className={styles.draftGridContainer}>
        <div className={styles.toolbar}>
          <ModeToggle mode={mode} onModeChange={onModeChange} />
          {mode === 'reorder' && (
            <p className={styles.hint}>Drag rows to set your ranking order</p>
          )}
          {mode === 'browse' && (
            <p className={styles.hint}>Sort and filter freely — rankings are not affected</p>
          )}
        </div>
        <div className={styles.gridWrapper}>
          <AgGridReact<DraftPlayer>
            ref={gridRef}
            theme={theme}
            columnDefs={mode === 'reorder' ? reorderColumnDefs : browseColumnDefs}
            rowData={players}
            rowDragManaged={mode === 'reorder'}
            onRowDragEnd={mode === 'reorder' ? onRowDragEnd : undefined}
            defaultColDef={{
              sortable: mode === 'browse',
              resizable: true,
              filter: mode === 'browse',
            }}
            getRowId={(params) => params.data.player_unique}
          />
        </div>
      </div>
    </AgGridProvider>
  );
}
