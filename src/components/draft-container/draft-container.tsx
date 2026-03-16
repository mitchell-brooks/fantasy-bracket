// ABOUTME: Draft ranking management container with AG Grid, CSV upload/download, and save functionality
// ABOUTME: Orchestrates the DraftGrid, mode toggling, and Supabase persistence for draft rankings
'use client';

import React, { useCallback, useState } from 'react';
import styles from './draft-container.module.css';
import { DownloadButton } from '@components/download-button/download-button';
import { UploadButton } from '@components/upload-button/upload-button';
import { RankingFullViewRow, RosterRankingRow } from '@lib/api';
import { useSupabase } from '@components/supabase-provider';
import pick from 'just-pick';
import { DraftGrid, type DraftPlayer } from '@components/draft-grid/draft-grid';

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
  players: Array<{ player_unique: string; ranking: number }>
): RosterRankingRow[] => {
  return players
    .filter((player) => player)
    .map((player) => {
      const { player_unique, ranking } = player;
      return { player_unique, roster_id, draft_num, ranking };
    });
};

const processRankingsForGrid = (
  unprocessedRankings: Record<string, any>[],
  allDraftablePlayers: Set<string | null>,
  sorted = false
): DraftPlayer[] => {
  if (!unprocessedRankings || !unprocessedRankings.length) return [];
  if (!sorted) unprocessedRankings.sort((a, b) => a.ranking - b.ranking);
  return unprocessedRankings
    .filter((player) => player && player.player_unique)
    .map((player) => {
      const eliminated = !(player.player_unique in (allDraftablePlayers as any));
      const desiredFields = [
        'player_unique',
        'tournament_points',
        'player_name',
        'ranking',
        'team_name',
        'seed',
        'points',
      ] as const;
      // @ts-expect-error - just-pick generic inference doesn't match our exact field list
      const picked = pick(player, desiredFields) as DraftPlayer;
      return { ...picked, eliminated };
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
  const { supabase } = useSupabase();
  const [players, setPlayers] = useState<DraftPlayer[]>(
    () => processRankingsForGrid(existingRankings || [], allDraftablePlayers) || []
  );
  const [mode, setMode] = useState<'reorder' | 'browse'>('reorder');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const insertRankings = async (rankingsToSave: Array<{ player_unique: string; ranking: number }>) => {
    setSaving(true);
    const rankingRows = generateRankingRows(roster_id, draft_num, rankingsToSave);

    const result = await supabase.from('rosterranking').upsert(rankingRows, {
      onConflict: 'player_unique,roster_id,draft_num',
      ignoreDuplicates: false,
    });
    setSaving(false);
    if (result.error) {
      console.error('Error inserting rankings:', result.error);
      alert(
        'There was an error submitting your rankings. Please double check and try again.'
      );
      return;
    }
    setHasUnsavedChanges(false);
  };

  const handleRankingsChange = useCallback((rankings: Array<{ player_unique: string; ranking: number }>) => {
    setHasUnsavedChanges(true);
    setPlayers((prev) =>
      prev.map((player) => {
        const updated = rankings.find((r) => r.player_unique === player.player_unique);
        if (updated) {
          return { ...player, ranking: updated.ranking };
        }
        return player;
      })
    );
  }, []);

  const handleSave = useCallback(() => {
    const rankings = players
      .filter((p) => p.ranking !== null)
      .map((p) => ({ player_unique: p.player_unique, ranking: p.ranking as number }));
    insertRankings(rankings);
  }, [players]);

  const saveRankingsFromCsv = useCallback((rankingsFromCsv: any) => {
    setHasUnsavedChanges(true);
    setPlayers(
      processRankingsForGrid(rankingsFromCsv, allDraftablePlayers, true)
    );
  }, [allDraftablePlayers]);

  return (
    <>
      <div className={styles.buttonContainer}>
        <DownloadButton
          buttonText="Get Ranking Template"
          tooltipText="Download player data and a ranking template as a csv file"
          filename={`draft_${draft_num}_ranking_template.csv`}
          data={csv}
        />
        <UploadButton
          onUpload={saveRankingsFromCsv}
          allDraftablePlayers={allDraftablePlayers}
        />
        {players.length > 0 && (
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saving}
          >
            {saving ? 'Saving...' : 'Submit Rankings'}
          </button>
        )}
      </div>
      <hr className={styles.line} />
      {players.length > 0 && (
        <>
          <div className={styles.confirm}>
            {hasUnsavedChanges ? (
              <p>
                Double check your rankings below to make sure they look
                right before submitting.
              </p>
            ) : (
              <p>
                The rankings you submitted for Draft {draft_num} are listed
                below. If you would like to change them, drag rows to reorder
                or upload a new CSV file.
              </p>
            )}
          </div>
          <DraftGrid
            players={players}
            mode={mode}
            onModeChange={setMode}
            onRankingsChange={handleRankingsChange}
          />
        </>
      )}
    </>
  );
};
