// ABOUTME: All teams page showing every team's drafted players in separate grids
// ABOUTME: Server component that groups data by team and renders each via AG Grid
import React from 'react';
import { createClient } from '@utils/supabase-server';
import { GridTitle } from '@components/grid-title/grid-title';
import { TeamPlayersGrid } from './team-players-grid';

export default async function PoolIdTeamsPage({
  params,
}: {
  params: Promise<{ pool_id: string }>;
}) {
  const { pool_id: pool_id_param } = await params;
  const pool_id = Number(pool_id_param);
  const supabase = await createClient();
  const { data: roster_data_results } = await supabase
    .from('roster_player_total_scores_view')
    .select(
      'roster_id, player_name, team_name, seed, total_player_points, pick_number, username, overall_seed'
    )
    .eq('pool_id', pool_id);

  const teamData: Record<string, typeof roster_data_results> = {};
  if (roster_data_results) {
    for (const cur of roster_data_results) {
      if (cur.team_name) {
        if (cur.team_name in teamData) {
          teamData[cur.team_name]?.push(cur);
        } else {
          teamData[cur.team_name] = [cur];
        }
      }
    }
  }

  return (
    <>
      {Object.values(teamData).map((teamPlayers, index) => {
        const sorted = [...teamPlayers].sort(
          (a, b) => (b?.total_player_points || 0) - (a?.total_player_points || 0)
        );
        const teamName = sorted[0]?.team_name;
        const rows = sorted.map((player) => ({
          player_name: player.player_name,
          total_player_points: player.total_player_points,
          username: player.username,
          roster_id: player.roster_id,
          pick_number: player.pick_number,
          pool_id,
        }));
        return (
          <React.Fragment key={index}>
            <GridTitle title={`${teamName}`} fixed={false} />
            <TeamPlayersGrid rows={rows} />
          </React.Fragment>
        );
      })}
    </>
  );
}
