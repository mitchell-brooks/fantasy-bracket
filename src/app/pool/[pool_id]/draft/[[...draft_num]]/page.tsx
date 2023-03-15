import { createClient } from '@utils/supabase-server';
import React from 'react';
import Papa from 'papaparse';
import { DownloadButton } from '@components/download-button/download-button';
import {
  DraftViewRow,
  Player_CompetitionRow,
  RosterRankingRow,
  Team_CompetitionRow,
} from '@lib/api';
import { DraftContainer } from '@components/draft-container/draft-container';
import * as api from '@lib/api';
import pick from 'just-pick';

const createCsv = (data: any) => {
  let csv;
  try {
    csv = Papa.unparse(data);
  } catch {
    console.log('Error creating CSV');
  }
  return csv;
};

const processDraftViewRowForCsv = (player_competition_row: DraftViewRow) => {
  const { player_stats, team_stats, team_win_loss, ...flat_data } =
    player_competition_row;
  const csv_row_data = Object.assign(
    {
      ranking: null,
      player_name: null,
      team_name: null,
      seed: null,
      region: null,
      overall_seed: null,
    },
    team_win_loss,
    flat_data,
    player_stats,
    team_stats
  );
  delete csv_row_data.team_unique;
  delete csv_row_data.competition_id;
  delete csv_row_data.league_unique;
  delete csv_row_data.round_started;
  delete csv_row_data.round_eliminated;
  delete csv_row_data.inactive;
  return csv_row_data;
};

export default async function PoolIdDraftPage({
  params: { pool_id, draft_num = 1 },
}: {
  params: { pool_id: number; draft_num: number };
}) {
  const supabase = createClient();

  // get roster_id for user based on pool_id
  // TODO check authentication
  const { data: roster_data, error: roster_error } = await supabase
    .from('roster')
    .select('roster_id')
    .eq('pool_id', pool_id);
  const roster_id = roster_data?.[0]?.roster_id;

  if (!roster_id) {
    return (
      <div>
        You don&apos;t seem to be a member of this pool. If you think this is a
        mistake, try logging in again.
      </div>
    );
  }
  // use roster_id and draft_num to get existing rankings
  const { data: ranking_data, error: ranking_error } = await supabase
    .from('ranking_full_view')
    .select('*')
    .eq('roster_id', roster_id)
    .eq('draft_num', draft_num);
  // console.log(ranking_data);

  const { data: pool_data, error: pool_error } = await supabase
    .from('pool_full_view')
    .select('*')
    .eq('pool_id', pool_id);

  const competition_id = pool_data?.[0]?.competition_id;
  const { data: draft_data, error } = await supabase
    .from('draft_view')
    .select('*')
    .eq('competition_id', competition_id)
    .is('round_eliminated', null);
  const allDraftablePlayers = draft_data
    ? Object.fromEntries(draft_data.map((row) => [row.player_unique, true]))
    : {};

  const players = draft_data?.map(processDraftViewRowForCsv);
  const csv = createCsv(players);
  return (
    <>
      <h1>Draft {draft_num} Rankings</h1>
      <DraftContainer
        pool_id={pool_id}
        draft_num={draft_num}
        roster_id={roster_id}
        csv={csv}
        allDraftablePlayers={allDraftablePlayers}
        existingRankings={ranking_data}
      />
    </>
  );
}

// const url = window.URL.createObjectURL(
//     new Blob([blob]),
// );
// const link = document.createElement('a');
// link.href = url;
// link.setAttribute(
//     'download',
//     `FileName.pdf`,
// );
//
// // Append to html link element page
// document.body.appendChild(link);
//
// // Start download
// link.click();
//
// // Clean up and remove the link
// link.parentNode.removeChild(link);
// });
