// ABOUTME: Pool leaderboard page showing participant rankings and prize split
// ABOUTME: Server component that fetches roster scores and renders via AG Grid
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

  const currency = pool_data?.[0]?.currency || "cent";
  const point_value = pool_data?.[0]?.point_value || 1;

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
      return {
        roster_id: row.roster_id || 0,
        username: row.username || '',
        total_roster_points: row.total_roster_points || 0,
        trailing,
        owes,
        active_players,
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
