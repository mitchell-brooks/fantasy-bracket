// ABOUTME: Single AG Grid showing all rosters with filter chips per participant
// ABOUTME: Clicking a chip filters the grid to that participant's players
'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { AgGridReact, AgGridProvider } from 'ag-grid-react';
import { AllCommunityModule, type ColDef, type ICellRendererParams } from 'ag-grid-community';
import { inkAndPaperTheme } from '@components/data-grid/theme';
import styles from './rosters-page.module.css';

const modules = [AllCommunityModule];

interface RosterPlayerRow {
  player_name: string | null;
  total_player_points: number | null;
  team_name: string | null;
  seed: number | null;
  pick_number: number | null;
  username: string | null;
  round_eliminated: number | null;
}

function PlayerNameRenderer(params: ICellRendererParams<RosterPlayerRow>) {
  if (!params.data) return null;
  if (params.data.round_eliminated) {
    return <s style={{ color: 'var(--color-text-eliminated)' }}>{params.data.player_name}</s>;
  }
  return params.data.player_name;
}

interface AllRostersGridProps {
  rows: RosterPlayerRow[];
  participants: string[];
}

export function AllRostersGrid({ rows, participants }: AllRostersGridProps) {
  const gridRef = useRef<AgGridReact<RosterPlayerRow>>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const theme = useMemo(() => inkAndPaperTheme, []);

  const columnDefs = useMemo<ColDef<RosterPlayerRow>[]>(() => [
    { field: 'username', headerName: 'Participant', headerTooltip: 'Participant', flex: 1, filter: 'agTextColumnFilter' },
    { field: 'player_name', headerName: 'Player', headerTooltip: 'Player Name', flex: 2, cellRenderer: PlayerNameRenderer },
    { field: 'total_player_points', headerName: 'Points', headerTooltip: 'Total Player Points', width: 100, sort: 'desc' },
    { field: 'team_name', headerName: 'Team', headerTooltip: 'Team Name', flex: 1, filter: 'agTextColumnFilter' },
    { field: 'seed', headerName: 'Seed', headerTooltip: 'Tournament Seed', width: 80 },
    { field: 'pick_number', headerName: 'Pick', headerTooltip: 'Draft Pick Number', width: 80 },
  ], []);

  const handleChipClick = useCallback((username: string) => {
    const api = gridRef.current?.api;
    if (!api) return;

    if (activeFilter === username) {
      api.setFilterModel(null);
      setActiveFilter(null);
    } else {
      api.setFilterModel({
        username: {
          filterType: 'text',
          type: 'equals',
          filter: username,
        },
      });
      setActiveFilter(username);
    }
  }, [activeFilter]);

  const handleClearFilter = useCallback(() => {
    const api = gridRef.current?.api;
    if (!api) return;
    api.setFilterModel(null);
    setActiveFilter(null);
  }, []);

  return (
    <AgGridProvider modules={modules}>
      <div className={styles.chips}>
        <button
          className={activeFilter === null ? styles.chipActive : styles.chip}
          onClick={handleClearFilter}
        >
          All
        </button>
        {participants.map((name) => (
          <button
            key={name}
            className={activeFilter === name ? styles.chipActive : styles.chip}
            onClick={() => handleChipClick(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <div className={styles.gridWrapper}>
        <AgGridReact<RosterPlayerRow>
          ref={gridRef}
          theme={theme}
          columnDefs={columnDefs}
          rowData={rows}
          defaultColDef={{
            sortable: true,
            resizable: true,
            filter: true,
          }}
          getRowId={(params) => `${params.data.username}-${params.data.player_name}-${params.data.pick_number}`}
          tooltipShowDelay={300}
        />
      </div>
    </AgGridProvider>
  );
}
