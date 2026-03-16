// ABOUTME: Client component that renders a single roster's players using AG Grid
// ABOUTME: Shows player name, points, team, seed, and pick number with eliminated player styling
'use client';

import { useMemo } from 'react';
import { DataGrid } from '@components/data-grid/data-grid';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import Link from 'next/link';

interface RosterRow {
  player_name: string;
  total_player_points: number | null;
  team_name: string | null;
  team_unique: string | null;
  seed: number | null;
  pick_number: number | null;
  round_eliminated: number | null;
  pool_id: number;
}

function PlayerNameCellRenderer(params: ICellRendererParams<RosterRow>) {
  const data = params.data;
  if (!data) return null;
  if (data.round_eliminated) {
    return <s style={{ color: 'var(--color-text-eliminated)' }}>{data.player_name}</s>;
  }
  return data.player_name;
}

function TeamCellRenderer(params: ICellRendererParams<RosterRow>) {
  const data = params.data;
  if (!data) return null;
  return (
    <Link href={`/pool/${data.pool_id}/team/${data.team_unique}`}>
      {data.team_name}
    </Link>
  );
}

export function RosterGrid({ rows }: { rows: RosterRow[] }) {
  const columnDefs = useMemo<ColDef<RosterRow>[]>(() => [
    { field: 'player_name', headerName: 'Name', flex: 2, cellRenderer: PlayerNameCellRenderer },
    { field: 'total_player_points', headerName: 'Points', flex: 1 },
    { field: 'team_name', headerName: 'Team', flex: 1, cellRenderer: TeamCellRenderer },
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
