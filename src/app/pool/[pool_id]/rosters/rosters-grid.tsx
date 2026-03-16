// ABOUTME: Client component that renders all rosters using AG Grid
// ABOUTME: Displays one grid per roster with player name, points, team, seed, and pick
'use client';

import { useMemo } from 'react';
import { DataGrid } from '@components/data-grid/data-grid';
import type { ColDef } from 'ag-grid-community';

interface RosterPlayerRow {
  player_name: string | null;
  total_player_points: number | null;
  team_name: string | null;
  seed: number | null;
  pick_number: number | null;
}

export function RostersGrid({ rows }: { rows: RosterPlayerRow[] }) {
  const columnDefs = useMemo<ColDef<RosterPlayerRow>[]>(() => [
    { field: 'player_name', headerName: 'Name', flex: 2 },
    { field: 'total_player_points', headerName: 'Points', flex: 1 },
    { field: 'team_name', headerName: 'Team', flex: 1 },
    { field: 'seed', headerName: 'Seed', width: 80 },
    { field: 'pick_number', headerName: 'Pick', width: 80 },
  ], []);

  const height = `${Math.max(250, rows.length * 48 + 56)}px`;

  return (
    <DataGrid
      columnDefs={columnDefs}
      rowData={rows}
      height={height}
      domLayout={rows.length < 20 ? 'autoHeight' : undefined}
    />
  );
}
