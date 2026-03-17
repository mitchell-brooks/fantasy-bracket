// ABOUTME: Two-grid draft ranking container with Explore Grid and Rank Grid
// ABOUTME: Orchestrates player browsing, ranking, CSV import/export, and Supabase persistence
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './draft-container.module.css';
import { DownloadButton } from '@components/download-button/download-button';
import { UploadButton } from '@components/upload-button/upload-button';
import {
  RankingFullViewRow,
  RosterRankingRow,
  ViewPoolPlayersFullRow,
} from '@lib/api';
import { useSupabase } from '@components/supabase-provider';
import { ExploreGrid, type ExplorePlayer } from '@components/explore-grid/explore-grid';
import { RankGrid, type RankedPlayer } from '@components/rank-grid/rank-grid';

interface DraftContainerProps {
  pool_id: number;
  draft_num: number;
  roster_id: number;
  csv?: string;
  allPlayers: ViewPoolPlayersFullRow[];
  existingRankings?: RankingFullViewRow[] | null;
}

function isRecordWithPoints(
  value: unknown
): value is Record<string, unknown> & { points: unknown } {
  return value != null && typeof value === 'object' && 'points' in value;
}

function extractPoints(playerStats: unknown): number | null {
  if (isRecordWithPoints(playerStats)) {
    return typeof playerStats.points === 'number' ? playerStats.points : null;
  }
  return null;
}

function toExplorePlayer(row: ViewPoolPlayersFullRow): ExplorePlayer {
  return {
    player_unique: row.player_unique ?? '',
    player_name: row.player_name ?? '',
    team_name: row.team_name ?? '',
    seed: row.seed,
    region: row.region,
    tournament_points: row.tournament_points,
    points: extractPoints(row.player_stats),
    overall_seed: row.overall_seed,
  };
}

function toRankedPlayer(row: RankingFullViewRow): RankedPlayer | null {
  if (!row.player_unique || row.ranking == null) return null;
  return {
    player_unique: row.player_unique,
    player_name: row.player_name ?? '',
    team_name: row.team_name ?? '',
    seed: row.seed,
    ranking: row.ranking,
  };
}

function buildInitialRankings(
  existingRankings: RankingFullViewRow[] | null | undefined
): RankedPlayer[] {
  if (!existingRankings?.length) return [];
  const sorted = [...existingRankings].sort(
    (a, b) => (a.ranking ?? 0) - (b.ranking ?? 0)
  );
  const result: RankedPlayer[] = [];
  for (const row of sorted) {
    const player = toRankedPlayer(row);
    if (player) result.push(player);
  }
  return result;
}

function generateRankingRows(
  roster_id: number,
  draft_num: number,
  players: Array<{ player_unique: string; ranking: number }>
): RosterRankingRow[] {
  return players
    .filter((player) => player)
    .map((player) => ({
      player_unique: player.player_unique,
      roster_id,
      draft_num,
      ranking: player.ranking,
    }));
}

export const DraftContainer: React.FC<DraftContainerProps> = ({
  pool_id,
  draft_num,
  roster_id,
  csv = 'There was an error loading the draft data',
  allPlayers,
  existingRankings,
}) => {
  const { supabase } = useSupabase();

  // Immutable server data transformed for the Explore Grid
  const explorePlayers = useMemo<ExplorePlayer[]>(
    () => allPlayers.map(toExplorePlayer),
    [allPlayers]
  );

  // Derive allDraftablePlayers lookup for UploadButton compatibility
  const allDraftablePlayers = useMemo<Record<string, boolean>>(
    () => Object.fromEntries(allPlayers.map((p) => [p.player_unique, true])),
    [allPlayers]
  );

  // Player lookup by player_unique for resolving CSV/add operations
  const playerLookup = useMemo<Map<string, ViewPoolPlayersFullRow>>(
    () => new Map(allPlayers.map((p) => [p.player_unique ?? '', p])),
    [allPlayers]
  );

  // Mutable rankings state
  const [rankings, setRankings] = useState<RankedPlayer[]>(
    () => buildInitialRankings(existingRankings)
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const [highlightedExploreId, setHighlightedExploreId] = useState<string | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const exploreHighlightTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(highlightTimerRef.current);
      clearTimeout(exploreHighlightTimerRef.current);
    };
  }, []);

  // Derived: map of player_unique → rank number for the Explore Grid
  const rankedPlayerMap = useMemo<Map<string, number>>(
    () => new Map(rankings.map((r) => [r.player_unique, r.ranking])),
    [rankings]
  );

  // Add players from Explore Grid to Rank Grid
  const handleAddPlayers = useCallback((playerUniques: string[]) => {
    setRankings((prev) => {
      let nextRanking = prev.length + 1;
      const newPlayers: RankedPlayer[] = [];
      const existingIds = new Set(prev.map((p) => p.player_unique));

      for (const id of playerUniques) {
        if (existingIds.has(id)) continue;
        const source = playerLookup.get(id);
        if (!source) continue;
        newPlayers.push({
          player_unique: source.player_unique ?? '',
          player_name: source.player_name ?? '',
          team_name: source.team_name ?? '',
          seed: source.seed,
          ranking: nextRanking,
        });
        nextRanking++;
      }
      return [...prev, ...newPlayers];
    });
    setHasUnsavedChanges(true);

    // Highlight newly added players briefly
    const newIds = new Set(playerUniques);
    setHighlightedIds(newIds);
    clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => setHighlightedIds(new Set()), 2000);
  }, [playerLookup]);

  // Remove a player from rankings
  const handleRemove = useCallback((playerUnique: string) => {
    setRankings((prev) => {
      const filtered = prev.filter((p) => p.player_unique !== playerUnique);
      return filtered.map((p, i) => ({ ...p, ranking: i + 1 }));
    });
    setHasUnsavedChanges(true);
  }, []);

  // Reorder rankings (from Rank Grid drag)
  const handleReorder = useCallback((reordered: RankedPlayer[]) => {
    setRankings(reordered);
    setHasUnsavedChanges(true);
  }, []);

  // Click a player in Rank Grid → scroll to them in Explore Grid
  const handlePlayerClick = useCallback((playerUnique: string) => {
    setHighlightedExploreId(playerUnique);
    clearTimeout(exploreHighlightTimerRef.current);
    exploreHighlightTimerRef.current = setTimeout(() => setHighlightedExploreId(null), 2000);
  }, []);

  // CSV upload handler — only accepts players that exist in the draftable set
  const handleCsvUpload = useCallback((rankingsFromCsv: Array<Record<string, unknown>>) => {
    if (rankings.length > 0) {
      const confirmed = window.confirm(
        'This will replace your current rankings. Continue?'
      );
      if (!confirmed) return;
    }
    const newRankings: RankedPlayer[] = [];
    let skippedCount = 0;
    for (const row of rankingsFromCsv) {
      if (!row || !row.player_unique || !row.ranking) continue;
      const playerUnique = String(row.player_unique);
      const source = playerLookup.get(playerUnique);
      if (!source) {
        skippedCount++;
        continue;
      }
      newRankings.push({
        player_unique: playerUnique,
        player_name: source.player_name ?? '',
        team_name: source.team_name ?? '',
        seed: source.seed,
        ranking: Number(row.ranking),
      });
    }
    if (skippedCount > 0) {
      alert(
        `${skippedCount} player(s) in the CSV were not found in the draftable player list and were skipped.`
      );
    }
    newRankings.sort((a, b) => a.ranking - b.ranking);
    // Re-number sequentially to fill gaps
    const renumbered = newRankings.map((p, i) => ({ ...p, ranking: i + 1 }));
    setRankings(renumbered);
    setHasUnsavedChanges(true);
  }, [playerLookup, rankings.length]);

  // Save rankings to Supabase
  const handleSave = useCallback(async () => {
    if (rankings.length === 0) return;
    setSaving(true);
    const rankingRows = generateRankingRows(roster_id, draft_num, rankings);

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
  }, [rankings, supabase, roster_id, draft_num]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>Draft {draft_num} Rankings</h1>
      </div>

      <div className={styles.toolbar}>
        <DownloadButton
          buttonText="Get Ranking Template"
          tooltipText="Download player data and a ranking template as a csv file"
          filename={`draft_${draft_num}_ranking_template.csv`}
          data={csv}
        />
        <UploadButton
          onUpload={handleCsvUpload}
          allDraftablePlayers={allDraftablePlayers}
        />
      </div>

      <div className={styles.gridLayout}>
        <div>
          <ExploreGrid
            players={explorePlayers}
            rankedPlayerMap={rankedPlayerMap}
            onAddPlayers={handleAddPlayers}
            highlightedId={highlightedExploreId}
          />
        </div>
        <div className={styles.rankPanel}>
          <RankGrid
            players={rankings}
            onReorder={handleReorder}
            onRemove={handleRemove}
            onPlayerClick={handlePlayerClick}
            highlightedIds={highlightedIds}
          />
        </div>
      </div>

      {hasUnsavedChanges && rankings.length > 0 && (
        <div className={styles.stickyBanner}>
          <p className={styles.bannerText}>
            You have unsaved changes to your rankings.
          </p>
          <button
            className={styles.submitButton}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Submit Rankings'}
          </button>
        </div>
      )}
    </div>
  );
};
