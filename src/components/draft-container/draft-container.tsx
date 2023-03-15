// 'use client'; according to https://github.com/vercel/next.js/discussions/46795
// use client should only be used at boundaries e.g. the top client component under a server component in the tree
import React, { useCallback } from 'react';
import { DownloadButton } from '@components/download-button/download-button';
import { UploadButton } from '@components/upload-button/upload-button';
import { RankingsTable } from '@components/rankings-table/rankings-table';
import { DraftViewRow, RankingFullViewRow, RosterRankingRow } from '@lib/api';
import * as api from '@lib/api';
import { useSupabase } from '@components/supabase-provider';
import pick from 'just-pick';

interface DraftContainerProps {
  pool_id: number;
  draft_num: number;
  roster_id: number;
  csv?: string;
  allDraftablePlayers: Set<string | null>;
  existingRankings?: RankingFullViewRow[] | null;
}

const generateRankingRows = (
  roster_id: number,
  draft_num: number,
  players: any[]
): RosterRankingRow[] => {
  const rankings_rows = players
    .filter((player) => player)
    .map((player) => {
      const { player_unique, ranking } = player;
      return { player_unique, roster_id, draft_num, ranking };
    });
  return rankings_rows;
};
const processRankingsForTable = (
  //   TODO fix this any type
  unprocessedRankings: Record<string, any>[],
  allDraftablePlayers: Set<string | null>,
  sorted = false
) => {
  console.log('inside process rankings', allDraftablePlayers);
  if (!unprocessedRankings || !unprocessedRankings.length) return [];
  if (!sorted) unprocessedRankings.sort((a, b) => a.ranking - b.ranking);
  return unprocessedRankings
    .filter(
      (player) =>
        player &&
        player.player_unique &&
        player.player_unique in allDraftablePlayers
    )
    .map((player) => {
      const desiredFields = [
        'player_unique',
        'player_name',
        'ranking',
        'team_name',
        'seed',
        'points',
      ] as const;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return pick(player, desiredFields);
    });
};
export const DraftContainer: React.FC<DraftContainerProps> = ({
  pool_id,
  draft_num,
  roster_id,
  csv = 'There was an error loading the draft data',
  existingRankings,
  allDraftablePlayers,
}) => {
  console.log(
    ':::allDraftablePlayers inside draft container:::',
    allDraftablePlayers
  );
  const { supabase } = useSupabase();
  const [rankings, setRankings] = React.useState<any[]>(
    () =>
      processRankingsForTable(existingRankings || [], allDraftablePlayers) || []
  );
  const insertRankings = async (rankingsFromCsv: Record<string, any>[]) => {
    const rankingRows = generateRankingRows(
      roster_id,
      draft_num,
      rankingsFromCsv
    );
    const result = await api.supabase.create(
      supabase,
      'rosterranking',
      rankingRows
    );
    return result;
  };

  const saveRankingsToState = useCallback((rankingsFromCsv: any) => {
    setRankings(
      processRankingsForTable(rankingsFromCsv, allDraftablePlayers, true)
    );
  }, []);

  return (
    <>
      <div>
        <DownloadButton
          buttonText="Get Ranking Template"
          tooltipText="Download player data and a ranking template as a csv file"
          filename="ranking_template.csv"
          data={csv}
        />
        <UploadButton
          onUpload={saveRankingsToState}
          allDraftablePlayers={allDraftablePlayers}
        />
        <br />
        <br />
        {rankings.length ? (
          <>
            <button onClick={() => insertRankings(rankings)}>
              Upload Rankings
            </button>
            <br />
            <br />
            <RankingsTable rankings={rankings} />
          </>
        ) : null}
      </div>
    </>
  );
};
