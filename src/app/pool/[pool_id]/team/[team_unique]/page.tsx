// ABOUTME: Single team detail page showing all drafted players from one team
// ABOUTME: Server component that fetches team-specific data and renders via AG Grid
import React from 'react';
import { createClient } from '@utils/supabase-server';
import { GridTitle } from '@components/grid-title/grid-title';
import { TeamPlayersGrid } from '../../teams/team-players-grid';

export default async function PoolIdTeamsPage({
  params,
}: {
  params: Promise<{ pool_id: string; team_unique: string }>;
}) {
  const { pool_id: pool_id_param, team_unique } = await params;
  const pool_id = Number(pool_id_param);
  const supabase = await createClient();
  const { data: roster_data_results } = await supabase
    .from('roster_player_total_scores_view')
    .select(
      'roster_id, team_unique, player_name, team_name, seed, total_player_points, pick_number, username, overall_seed'
    )
    .eq('pool_id', pool_id)
    .eq('team_unique', team_unique);

  const sorted = (roster_data_results || []).sort(
    (a, b) => (b?.total_player_points || 0) - (a?.total_player_points || 0)
  );
  const teamName = sorted[0]?.team_name || 'Team';
  const rows = sorted.map((player) => ({
    player_name: player.player_name,
    total_player_points: player.total_player_points,
    username: player.username,
    roster_id: player.roster_id,
    pick_number: player.pick_number,
    pool_id,
  }));

  return (
    <>
      <GridTitle title={`${teamName}`} fixed={false} />
      <TeamPlayersGrid rows={rows} />
    </>
  );
}
