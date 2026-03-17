// ABOUTME: Single AG Grid showing all teams' players with filter chips per team
// ABOUTME: Clicking a chip filters the grid to that team's players
'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { AgGridReact, AgGridProvider } from 'ag-grid-react';
import { AllCommunityModule, type ColDef, type ICellRendererParams } from 'ag-grid-community';
import { inkAndPaperTheme } from '@components/data-grid/theme';
import Link from 'next/link';
import styles from './teams-page.module.css';

const modules = [AllCommunityModule];

interface TeamPlayerRow {
  player_name: string | null;
  total_player_points: number | null;
  team_name: string | null;
  seed: number | null;
  pick_number: number | null;
  username: string | null;
  round_eliminated: number | null;
  pool_id: number;
  roster_id: number | null;
}

function PlayerNameRenderer(params: ICellRendererParams<TeamPlayerRow>) {
  if (!params.data) return null;
  if (params.data.round_eliminated) {
    return <s style={{ color: 'var(--color-text-eliminated)' }}>{params.data.player_name}</s>;
  }
  return params.data.player_name;
}

function DraftedByRenderer(params: ICellRendererParams<TeamPlayerRow>) {
  if (!params.data?.username) return null;
  return (
    <Link href={`/pool/${params.data.pool_id}/roster/${params.data.roster_id}`}>
      {params.data.username}
    </Link>
  );
}

interface AllTeamsGridProps {
  rows: TeamPlayerRow[];
  teams: string[];
}

export function AllTeamsGrid({ rows, teams }: AllTeamsGridProps) {
  const gridRef = useRef<AgGridReact<TeamPlayerRow>>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const theme = useMemo(() => inkAndPaperTheme, []);

  const columnDefs = useMemo<ColDef<TeamPlayerRow>[]>(() => [
    { field: 'team_name', headerName: 'Team', headerTooltip: 'Team Name', flex: 1, filter: 'agTextColumnFilter' },
    { field: 'seed', headerName: 'Seed', headerTooltip: 'Tournament Seed', width: 80 },
    { field: 'player_name', headerName: 'Player', headerTooltip: 'Player Name', flex: 2, cellRenderer: PlayerNameRenderer },
    { field: 'total_player_points', headerName: 'Points', headerTooltip: 'Total Player Points', width: 100, sort: 'desc' },
    { field: 'username', headerName: 'Drafted By', headerTooltip: 'Drafted By', flex: 1, cellRenderer: DraftedByRenderer, filter: 'agTextColumnFilter' },
    { field: 'pick_number', headerName: 'Pick', headerTooltip: 'Draft Pick Number', width: 80 },
  ], []);

  const handleChipClick = useCallback((teamName: string) => {
    const api = gridRef.current?.api;
    if (!api) return;

    if (activeFilter === teamName) {
      api.setFilterModel(null);
      setActiveFilter(null);
    } else {
      api.setFilterModel({
        team_name: {
          filterType: 'text',
          type: 'equals',
          filter: teamName,
        },
      });
      setActiveFilter(teamName);
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
        {teams.map((name) => (
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
        <AgGridReact<TeamPlayerRow>
          ref={gridRef}
          theme={theme}
          columnDefs={columnDefs}
          rowData={rows}
          defaultColDef={{
            sortable: true,
            resizable: true,
            filter: true,
          }}
          getRowId={(params) => `${params.data.team_name}-${params.data.player_name}-${params.data.roster_id}`}
          tooltipShowDelay={300}
        />
      </div>
    </AgGridProvider>
  );
}
