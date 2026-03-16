// ABOUTME: Client component that renders draft results using AG Grid
// ABOUTME: Shows pick order, round, player name, team, seed, and drafter
'use client';

import { useMemo } from 'react';
import { DataGrid } from '@components/data-grid/data-grid';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import Link from 'next/link';

interface ResultRow {
  round: number | null;
  pick_number: number | null;
  username: string | null;
  player_name: string | null;
  team_name: string | null;
  seed: number | null;
  pool_id: number;
  draft_num: number;
}

function UserCellRenderer(params: ICellRendererParams<ResultRow>) {
  const data = params.data;
  if (!data) return null;
  return (
    <Link href={`/pool/${data.pool_id}/draft/${data.draft_num}/results/${data.username}`}>
      {data.username}
    </Link>
  );
}

export function ResultsGrid({ rows }: { rows: ResultRow[] }) {
  const columnDefs = useMemo<ColDef<ResultRow>[]>(() => [
    { field: 'round', headerName: 'Round', width: 80 },
    { field: 'pick_number', headerName: 'Pick', width: 80 },
    { field: 'username', headerName: 'User', flex: 1, cellRenderer: UserCellRenderer },
    { field: 'player_name', headerName: 'Name', flex: 2 },
    { field: 'team_name', headerName: 'Team', flex: 1 },
    { field: 'seed', headerName: 'Seed', width: 80 },
  ], []);

  return (
    <DataGrid
      columnDefs={columnDefs}
      rowData={rows}
      height="600px"
    />
  );
}
