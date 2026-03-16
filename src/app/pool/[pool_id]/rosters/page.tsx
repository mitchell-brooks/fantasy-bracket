// ABOUTME: All rosters page showing every participant's roster in separate grids
// ABOUTME: Server component that groups roster data by roster_id and renders each via AG Grid
import React from 'react';
import { createClient } from '@utils/supabase-server';
import { GridTitle } from '@components/grid-title/grid-title';
import { RostersGrid } from './rosters-grid';

export default async function PoolIdDraftResultsDraftNumUsernamePage({
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
      'roster_id, player_name, team_name, seed, total_player_points, pick_number, username'
    )
    .eq('pool_id', pool_id);

  type RosterRow = NonNullable<typeof roster_data_results>[number];
  const rosterData: Record<string, RosterRow[]> = {};
  if (roster_data_results) {
    for (const cur of roster_data_results) {
      if (cur.roster_id) {
        const key = cur.roster_id.toString();
        if (key in rosterData) {
          rosterData[key]?.push(cur);
        } else {
          rosterData[key] = [cur];
        }
      }
    }
  }

  return (
    <>
      {Object.values(rosterData).map((roster, index) => {
        const sorted = [...roster].sort(
          (a, b) => (a?.pick_number || 0) - (b?.pick_number || 0)
        );
        const username = sorted[0]?.username;
        const rows = sorted.map((player) => ({
          player_name: player.player_name,
          total_player_points: player.total_player_points,
          team_name: player.team_name,
          seed: player.seed,
          pick_number: player.pick_number,
        }));
        return (
          <React.Fragment key={index}>
            <GridTitle title={username ? `${username.toUpperCase()}` : 'Roster'} />
            <RostersGrid rows={rows} />
          </React.Fragment>
        );
      })}
    </>
  );
}
