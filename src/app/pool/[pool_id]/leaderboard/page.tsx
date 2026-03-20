// ABOUTME: Pool leaderboard page showing participant rankings and prize split
// ABOUTME: Server component that fetches roster scores, active players, and yet-to-play counts
import React from "react";
import styles from "./page.module.css";
import { createClient } from "@utils/supabase-server";
import { formatPointValue } from "@/utils";
import { GridTitle } from "@components/grid-title/grid-title";
import { ScoresUpdatedFooter } from "@components/scores-updated-footer/scores-updated-footer";
import { LeaderboardGrid } from "./leaderboard-grid";

export default async function PoolIdDraftNumResults({
  params,
}: {
  params: Promise<{ pool_id: string; draft_num?: string }>;
}) {
  const { pool_id: pool_id_param, draft_num: draft_num_param = '1' } = await params;
  const pool_id = Number(pool_id_param);
  const supabase = await createClient();
  const { data: roster_total_score_data } =
    await supabase
      .from("view_roster_total_score")
      .select("*")
      .eq("pool_id", pool_id);

  const { data: active_player_data } =
    await supabase
      .from("roster_active_players_view")
      .select("*")
      .eq("pool_id", pool_id);
  const activePlayersDict = active_player_data?.reduce<
    Record<string, number | null>
  >((acc, roster) => {
    if (roster?.roster_id) {
      acc[roster.roster_id] = roster.active_players;
    }
    return acc;
  }, {});

  const { data: pool_data } = await supabase
    .from("pool")
    .select("*")
    .eq("pool_id", pool_id);

  const competition_id = pool_data?.[0]?.competition_id;
  const currency = pool_data?.[0]?.currency || "cent";
  const point_value = pool_data?.[0]?.point_value || 1;

  // Compute "yet to play today" — players with a game today that hasn't been scored
  const today = new Date().toISOString().split('T')[0];
  const yetToPlayDict: Record<number, number> = {};
  if (competition_id && today) {
    // Get today's games
    const { data: todaysGames } = await supabase
      .from('game')
      .select('game_id')
      .eq('competition_id', competition_id)
      .eq('game_date', today);

    if (todaysGames && todaysGames.length > 0) {
      const gameIds = todaysGames.map((g) => g.game_id);

      // Get players in today's games
      const { data: playersInTodaysGames } = await supabase
        .from('players_in_games_view')
        .select('player_unique, game_id')
        .eq('competition_id', competition_id)
        .in('game_id', gameIds);

      // Get which of today's games have been scored
      const { data: scoredGames } = await supabase
        .from('player_game')
        .select('game_id')
        .in('game_id', gameIds);
      const scoredGameIds = new Set((scoredGames ?? []).map((sg) => sg.game_id));

      // Get roster membership for all players
      const { data: rosterPlayers } = await supabase
        .from('roster_player_total_scores_view')
        .select('player_unique, roster_id')
        .eq('pool_id', pool_id);
      const playerToRoster = new Map(
        (rosterPlayers ?? []).map((rp) => [rp.player_unique, rp.roster_id])
      );

      // Count players per roster who have an unscored game today
      for (const pig of (playersInTodaysGames ?? [])) {
        if (!pig.player_unique || !pig.game_id) continue;
        if (scoredGameIds.has(pig.game_id)) continue;
        const rosterId = playerToRoster.get(pig.player_unique);
        if (rosterId != null) {
          yetToPlayDict[rosterId] = (yetToPlayDict[rosterId] ?? 0) + 1;
        }
      }
    }
  }

  const sortedRosterData = roster_total_score_data?.sort(
    (a, b) => (b?.total_roster_points || 0) - (a?.total_roster_points || 0)
  );

  const highestScore = sortedRosterData?.[0]?.total_roster_points || 0;
  let totalWinnings = 0;

  const leaderboardRows =
    sortedRosterData?.map((row) => {
      let active_players = 0;
      if (row?.roster_id) {
        active_players = activePlayersDict?.[row?.roster_id] || 0;
      }
      const trailing = highestScore - (row?.total_roster_points || 0);
      totalWinnings += trailing;
      const owes = formatPointValue(trailing, currency, point_value);
      const yet_to_play = row.roster_id ? (yetToPlayDict[row.roster_id] ?? 0) : 0;
      return {
        roster_id: row.roster_id || 0,
        username: row.username || '',
        total_roster_points: row.total_roster_points || 0,
        trailing,
        owes,
        active_players,
        yet_to_play,
        pool_id,
      };
    }) || [];

  return (
    <>
      <GridTitle title="Leaderboard" fixed={true} />
      <LeaderboardGrid rows={leaderboardRows} />
      <ScoresUpdatedFooter poolId={String(pool_id)} />
      <div className={styles.total}>
        <div className={styles.totalColumn}>
          <h1 className={styles.prizeSplitTitle}>Prize Split</h1>
          <div>
            First place:{" "}
            {formatPointValue(totalWinnings * 0.75, currency, point_value)}
          </div>
          <div>
            Second place:{" "}
            {formatPointValue(totalWinnings * 0.25, currency, point_value)}
          </div>
        </div>
      </div>
    </>
  );
}
