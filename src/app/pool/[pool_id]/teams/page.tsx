// ABOUTME: All teams page showing every team's drafted players in a single filterable grid
// ABOUTME: Filter chips let users quickly view one team's players
import React from 'react';
import { createClient } from '@utils/supabase-server';
import { AllTeamsGrid } from './all-teams-grid';
import styles from './teams-page.module.css';

export default async function AllTeamsPage({
  params,
}: {
  params: Promise<{ pool_id: string }>;
}) {
  const { pool_id: pool_id_param } = await params;
  const pool_id = Number(pool_id_param);
  const supabase = await createClient();
  const { data: roster_data } = await supabase
    .from('roster_player_total_scores_view')
    .select(
      'roster_id, player_name, team_name, seed, total_player_points, pick_number, username, round_eliminated, overall_seed'
    )
    .eq('pool_id', pool_id);

  const rows = (roster_data ?? []).map((player) => ({
    player_name: player.player_name,
    total_player_points: player.total_player_points,
    team_name: player.team_name,
    seed: player.seed,
    pick_number: player.pick_number,
    username: player.username,
    round_eliminated: player.round_eliminated,
    roster_id: player.roster_id,
    pool_id,
  }));

  const teams = [...new Set(
    (roster_data ?? [])
      .map((r) => r.team_name)
      .filter((t): t is string => t != null)
  )].sort();

  return (
    <div className={styles.page}>
      <h1>All Teams</h1>
      <AllTeamsGrid rows={rows} teams={teams} />
    </div>
  );
}
