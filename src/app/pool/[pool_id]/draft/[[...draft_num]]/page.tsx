import { createClient } from '@utils/supabase-server';
import React from 'react';
import Papa from 'papaparse';
import { DownloadButton } from '@components/download-button/download-button';
import { Team_CompetitionRow } from '@lib/api';
import { DraftContainer } from '@components/draft-container/draft-container';

const create_csv = (data: any) => {
  const csv = Papa.unparse(data);
  return csv;
};

const generateRankingsRows = (
  roster_id: number,
  draft_num: number,
  players: any[]
) => {
  const rankings_rows = players.map((player) => {
    const { player_unique, ranking } = player;
    return { player_unique, roster_id, draft_num, ranking };
  });
  return rankings_rows;
};
const uploadRankings = async (rankings: any[]) => {};

export default async function PoolIdDraftPage({
  params: { pool_id, draft_num = 1 },
}: {
  params: { pool_id: number; draft_num: number };
}) {
  const supabase = createClient();
  const { data: pool_data, error: pool_error } = await supabase
    .from('pool')
    .select('competition_id')
    .eq('pool_id', pool_id);
  const competition_id = pool_data?.[0]?.competition_id;
  // const { data, error } = await supabase
  //   .from('player_competition')
  //   .select(
  //     `
  //   *,
  //   team(
  //     team_name,
  //     team_competition(
  //     *
  //     )
  //     ),
  //   player (
  //     *
  //     )
  //     `
  //   )
  //   .eq('competition_id', competition_id)
  //   // .is('round_eliminated', null);
  // // .filter('round_eliminated', 'is', null);
  const { data, error } = await supabase
    .from('draft_view')
    .select('*')
    .eq('competition_id', competition_id)
    .is('round_eliminated', null);
  console.log(data || error);
  const players = data?.map((player_competition_row) => {
    // const { team, player, player_stats, ...player_competition_rest } =
    //   player_competition_row;
    // let team_name, team_competition;
    // if (Array.isArray(team)) {
    //   team_name = team[0]?.team_name;
    //   team_competition = Array.isArray(team[0]?.team_competition)
    //     ? team[0]?.team_competition[0]
    //     : team[0]?.team_competition;
    // } else {
    //   team_name = team?.team_name;
    //   team_competition = Array.isArray(team?.team_competition)
    //     ? team?.team_competition[0]
    //     : team?.team_competition;
    // }
    // const { team_stats: team_stats, ...team_competition_rest } =
    //   team_competition as Team_CompetitionRow;
    //
    // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // // @ts-ignore
    // const { wins, losses, conference, conference_wins, conference_losses } =
    //   team_stats as Team_CompetitionRow['team_stats'];
    // const csv_row_data = Object.assign(
    //   { ranking: null, player_name: null, team_name: null },
    //   {
    //     team_name,
    //     ...team_competition_rest,
    //     wins,
    //     losses,
    //     conference,
    //     conference_wins,
    //     conference_losses,
    //   },
    //   player,
    //   player_competition_rest,
    //   player_stats
    // );
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
  });
  const { data: roster_data, error: roster_error } = await supabase
    .from('roster')
    .select('roster_id')
    .eq('pool_id', pool_id);
  const roster_id = roster_data?.[0]?.roster_id;
  const { data: ranking_data, error: ranking_error } = await supabase
    .from('rosterranking')
    .select('*')
    .eq('roster_id', roster_id)
    .eq('draft_num', draft_num);
  const csv = create_csv(players);
  return (
    <>
      <DraftContainer
        csv={csv}
        players={players}
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
