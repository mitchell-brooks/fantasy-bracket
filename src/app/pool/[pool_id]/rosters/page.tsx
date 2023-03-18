import React from 'react';
import { createClient } from '@utils/supabase-server';
import { Table } from '@components/table/table';
import { GridTitle } from '@components/grid-title/grid-title';

export default async function PoolIdDraftResultsDraftNumUsernamePage({
  params: { pool_id },
}: {
  params: { pool_id: string };
}) {
  const supabase = createClient();
  const { data: roster_data_results, error } = await supabase
    .from('roster_player_total_scores_view')
    .select(
      'roster_id, player_name, team_name, seed, total_player_points,pick_number, username'
    )
    .eq('pool_id', pool_id);

  let rosterData: Record<string, any[]> = {};
  if (roster_data_results) {
    rosterData = roster_data_results?.reduce<Record<string, any[]>>(
      (acc, cur) => {
        if (cur.roster_id) {
          const roster_id: string = cur.roster_id.toString();
          if (cur.roster_id in acc) {
            acc[roster_id].push(cur);
          } else {
            acc[roster_id] = [cur];
          }
        }
        return acc;
      },
      {}
    );
  }

  const columns = [
    {
      Header: 'Player',
      columns: [
        { Header: 'Name', accessor: 'player_name' },
        { Header: 'Points', accessor: 'total_player_points', footer: 'Total' },
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

  const rosters = Object.values(rosterData).map((roster) => {
    roster.sort((a, b) => (a?.pick_number || 0) - (b?.pick_number || 0));
    const username = roster[0].username;
    return (
      <>
        <GridTitle title={username ? `${username.toUpperCase()}` : 'Roster'} />
        <Table columns={columns} data={roster || []} />
      </>
    );
  });
  return <>{rosters}</>;
}
