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
  note: string | null;
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
    const playerUnique = params.data.player_unique;
    return (
      <button
        className={styles.removeButton}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(playerUnique);
        }}
        title="Remove from rankings"
      >
        ✕
      </button>
    );
  }, [onRemove]);

  const columnDefs = useMemo<ColDef<RankedPlayer>[]>(() => [
    { rowDrag: true, width: 40, sortable: false, resizable: false, headerName: '', suppressHeaderMenuButton: true },
    { field: 'ranking', headerName: '#', headerTooltip: 'Rank', width: 55, sortable: false },
    {
      field: 'player_name',
      headerName: 'Player',
      headerTooltip: 'Player Name',
      flex: 2,
      sortable: false,
      cellStyle: { cursor: 'pointer' },
      onCellClicked: (params) => {
        if (params.data && onPlayerClick) {
          onPlayerClick(params.data.player_unique);
        }
      },
    },
    { field: 'team_name', headerName: 'Team', headerTooltip: 'Team Name', flex: 1, sortable: false },
    { field: 'seed', headerName: 'Seed', headerTooltip: 'Tournament Seed', width: 70, sortable: false },
    { field: 'note', headerName: 'Notes', headerTooltip: 'Injury/eligibility notes', flex: 2, sortable: false },
    {
      headerName: '',
      width: 50,
      sortable: false,
      filter: false,
      resizable: false,
      cellRenderer: RemoveCellRenderer,
      suppressHeaderMenuButton: true,
    },
  ], [RemoveCellRenderer, onPlayerClick]);

  const onRowDragEnd = useCallback((_event: RowDragEndEvent<RankedPlayer>) => {
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
            defaultColDef={{ resizable: true }}
          />
        </div>
      </div>
    </AgGridProvider>
  );
}
