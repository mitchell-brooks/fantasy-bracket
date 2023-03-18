import React from 'react';
import { createClient } from '@utils/supabase-server';
import { Table } from '@components/table/table';
import { GridTitle } from '@components/grid-title/grid-title';

export default async function PoolIdDraftResultsDraftNumUsernamePage({
  params: { pool_id, roster_id },
}: {
  params: { pool_id: string; roster_id: string | number };
}) {
  const supabase = createClient();
  const { data: roster_data_results, error } = await supabase
    .from('roster_player_total_scores_view')
    .select(
      'player_name, team_name, seed, total_player_points,pick_number, username'
    )
    .eq('pool_id', pool_id)
    .eq('roster_id', roster_id);

  const username = roster_data_results?.[0]?.username as string;

  const rosterData = roster_data_results?.sort(
    (a, b) => (a?.pick_number || 0) - (b?.pick_number || 0)
  );

  const columns = [
    {
      Header: 'Player',
      columns: [
        { Header: 'Name', accessor: 'player_name' },
        { Header: 'Points', accessor: 'total_player_points' },
      ],
    },
    {
      Header: 'Team',
      columns: [
        { Header: 'Team', accessor: 'team_name' },
        { Header: 'Seed', accessor: 'seed' },
      ],
    },
    {
      Header: 'Pick',
      columns: [{ Header: 'Pick', accessor: 'pick_number' }],
    },
  ];
  return (
    <>
      <GridTitle title={username ? `${username.toUpperCase()}` : 'Roster'} />
      <Table columns={columns} data={rosterData || []} />
    </>
  );
}
