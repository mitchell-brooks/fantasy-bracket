// ABOUTME: Draft ranking page where users set their player ranking preferences
// ABOUTME: Server component that loads player data, generates CSV template, and renders DraftContainer
import { createClient } from '@utils/supabase-server';
import React from 'react';
import Papa from 'papaparse';
import {
  ViewPoolPlayersFullRow,
} from '@lib/api';
import { DraftContainer } from '@components/draft-container/draft-container';

const createCsv = (data: any) => {
  let csv;
  try {
    csv = Papa.unparse(data);
  } catch {
    console.log('Error creating CSV');
  }
  return csv;
};

const transformPlayerRowForCsv = (
  player_competition_row: ViewPoolPlayersFullRow
) => {
  const {
    player_stats,
    team_stats,
    team_win_loss,
    // destructuring properties to omit
    team_unique: _team_unique,
    competition_id: _competition_id,
    round_started: _round_started,
    round_eliminated: _round_eliminated,
    inactive: _inactive,
    pick_number: _pick_number,
    round_start: _round_start,
    round_end: _round_end,
    roster_id: _roster_id,
    ...flat_data
  } = player_competition_row;
  const csv_row_data = Object.assign(
    {
      ranking: null,
      player_name: null,
      tournament_points: null,
      team_name: null,
      seed: null,
      note: null,
      region: null,
      overall_seed: null,
    },
    team_win_loss,
    flat_data,
    player_stats,
    team_stats
  );
  return csv_row_data;
};

export default async function PoolIdDraftPage({
  params,
}: {
  params: Promise<{ pool_id: string; draft_num?: string }>;
}) {
  const { pool_id: pool_id_param, draft_num: draft_num_param = '1' } = await params;
  const pool_id = Number(pool_id_param);
  const draft_num = Number(draft_num_param);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const user_id = user?.id;
  if (!user_id) return <div>Not logged in</div>;

  // TODO check authentication
  const { data: roster_data } = await supabase
    .from('roster')
    .select('roster_id')
    .eq('pool_id', pool_id)
    .eq('user_id', user_id);
  const roster_id = roster_data?.[0]?.roster_id;

  if (!roster_id) {
    return (
      <div>
        You don&apos;t seem to be a member of this pool. If you think this is a
        mistake, try logging in again.
      </div>
    );
  }

  const { data: ranking_data } = await supabase
    .from('ranking_full_view')
    .select('*')
    .eq('roster_id', roster_id)
    .eq('draft_num', draft_num);

  const { data: available_players_data } = await supabase
    .from('view_pool_players_full')
    .select('*')
    .eq('pool_id', pool_id)
    .is('round_eliminated', null)
    .is('roster_id', null);

  const players = available_players_data?.map(transformPlayerRowForCsv);
  const csv = createCsv(players);
  return (
    <>
      <DraftContainer
        pool_id={pool_id}
        draft_num={draft_num}
        roster_id={roster_id}
        csv={csv}
        allPlayers={available_players_data ?? []}
        existingRankings={ranking_data}
      />
    </>
  );
}
