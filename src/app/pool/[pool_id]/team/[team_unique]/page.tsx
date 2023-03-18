import React from 'react';
import { createClient } from '@utils/supabase-server';
import { Table } from '@components/table/table';
import { GridTitle } from '@components/grid-title/grid-title';
import Link from 'next/link';

export default async function PoolIdTeamsPage({
  params: { pool_id, team_unique },
}: {
  params: { pool_id: string; team_unique: string };
}) {
  const supabase = createClient();
  const { data: roster_data_results, error } = await supabase
    .from('roster_player_total_scores_view')
    .select(
      'roster_id, team_unique, player_name, team_name, seed, total_player_points,pick_number, username, overall_seed'
    )
    .eq('pool_id', pool_id)
    .eq('team_unique', team_unique);

  let teamData: Record<string, any[]> = {};
  if (roster_data_results) {
    teamData = roster_data_results?.reduce<Record<string, any[]>>(
      (acc, cur) => {
        if (cur.team_name) {
          const team_name: string = cur.team_name;
          if (cur.team_name in acc) {
            acc[team_name].push(cur);
          } else {
            acc[team_name] = [cur];
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
      Header: 'Pick',
      columns: [
        { Header: 'Drafted by', accessor: 'username' },
        { Header: 'Pick', accessor: 'pick_number' },
      ],
    },
  ];

  const teams = Object.values(teamData).map((teamPlayers) => {
    teamPlayers.sort(
      (a, b) => (b?.total_player_points || 0) - (a?.total_player_points || 0)
    );
    const mappedTeamPlayers = teamPlayers.map((teamPlayer) => {
      return {
        ...teamPlayer,
        username: (
          <Link href={`/pool/${pool_id}/roster/${teamPlayer.roster_id}`}>
            {teamPlayer.username}
          </Link>
        ),
      };
    });
    const teamName = teamPlayers[0]?.team_name;
    const teamSeed = teamPlayers[0]?.seed;
    return (
      <>
        <GridTitle title={`${teamName}`} fixed={false} />
        <Table columns={columns} data={mappedTeamPlayers || []} />
      </>
    );
  });
  return <>{teams}</>;
}
