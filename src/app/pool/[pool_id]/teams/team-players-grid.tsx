// ABOUTME: Client component that renders a team's players using AG Grid
// ABOUTME: Shows player name, points, drafter (linked), and pick number
'use client';

import { useMemo } from 'react';
import { DataGrid } from '@components/data-grid/data-grid';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import Link from 'next/link';

interface TeamPlayerRow {
  player_name: string | null;
  total_player_points: number | null;
  username: string | null;
  roster_id: number | null;
  pick_number: number | null;
  pool_id: number;
}

function DraftedByCellRenderer(params: ICellRendererParams<TeamPlayerRow>) {
  const data = params.data;
  if (!data) return null;
  return (
    <Link href={`/pool/${data.pool_id}/roster/${data.roster_id}`}>
      {data.username}
    </Link>
  );
}

export function TeamPlayersGrid({ rows }: { rows: TeamPlayerRow[] }) {
  const columnDefs = useMemo<ColDef<TeamPlayerRow>[]>(() => [
    { field: 'player_name', headerName: 'Name', flex: 2 },
    { field: 'total_player_points', headerName: 'Points', flex: 1 },
    { field: 'username', headerName: 'Drafted by', flex: 1, cellRenderer: DraftedByCellRenderer },
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
