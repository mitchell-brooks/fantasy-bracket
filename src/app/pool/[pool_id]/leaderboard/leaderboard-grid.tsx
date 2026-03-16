// ABOUTME: Client component that renders the pool leaderboard using AG Grid
// ABOUTME: Shows participant rankings with points, trailing amount, and active player count
'use client';

import { useMemo } from 'react';
import { DataGrid } from '@components/data-grid/data-grid';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import Link from 'next/link';

interface LeaderboardRow {
  roster_id: number;
  username: string;
  total_roster_points: number;
  trailing: number;
  owes: string;
  active_players: number;
  pool_id: number;
}

function UsernameCellRenderer(params: ICellRendererParams<LeaderboardRow>) {
  const data = params.data;
  if (!data) return null;
  return (
    <Link href={`/pool/${data.pool_id}/roster/${data.roster_id}`}>
      {data.username}
    </Link>
  );
}

export function LeaderboardGrid({ rows }: { rows: LeaderboardRow[] }) {
  const columnDefs = useMemo<ColDef<LeaderboardRow>[]>(() => [
    { field: 'username', headerName: 'Participant', flex: 2, cellRenderer: UsernameCellRenderer },
    { field: 'total_roster_points', headerName: 'Points', flex: 1, sort: 'desc' },
    { field: 'trailing', headerName: 'Trailing', flex: 1 },
    { field: 'owes', headerName: 'Owes', flex: 1 },
    { field: 'active_players', headerName: 'Active Players', flex: 1 },
  ], []);

  const height = `${Math.max(300, rows.length * 48 + 56)}px`;

  return (
    <DataGrid
      columnDefs={columnDefs}
      rowData={rows}
      height={height}
      domLayout={rows.length < 20 ? 'autoHeight' : undefined}
    />
  );
}
