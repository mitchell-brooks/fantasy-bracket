import React from "react";
import styles from "./page.module.css";
import { createClient } from "@utils/supabase-server";
import { Table } from "@components/table/table";
import Link from "next/link";
import { formatPointValue } from "@/utils";
import { GridTitle } from "@components/grid-title/grid-title";
import { ScoresUpdatedFooter } from "@components/scores-updated-footer/scores-updated-footer";

export default async function PoolIdDraftNumResults({
                                                      params: { pool_id, draft_num = 1 }
                                                    }: {
  params: { pool_id: string; draft_num: string | number };
}) {
  //TODO remove this hard coded value
  const COMPETITION_ID = pool_id === "14" ? 5 : 1;
  draft_num = Number(draft_num);
  const supabase = createClient();
  const { data: roster_total_score_data, error: total_score_error } =
    await supabase
      .from("view_roster_total_score")
      .select("*")
      .eq("pool_id", pool_id);

  const { data: active_player_data, error: active_players_error } =
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

  const { data: pool_data, error: poolmeta_error } = await supabase
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

  const rosterTotalScores =
    sortedRosterData?.map((row) => {
      let username;
      if (row?.username) {
        username = (
          <Link href={`/pool/${pool_id}/roster/${row.roster_id}`}>
            {row?.username}
          </Link>
        );
      }
      let active_players: string | number = "";
      if (row?.roster_id) {
        active_players = activePlayersDict?.[row?.roster_id] || 0;
      }
      const trailing = highestScore - (row?.total_roster_points || 0);
      totalWinnings += trailing;
      const owes = formatPointValue(trailing, currency, point_value);
      return { trailing, owes, active_players, ...row, username };
    }) || [];

  const columns = [
    {
      Header: "Participant",
      columns: [{ Header: "Username", accessor: "username" }]
    },
    {
      Header: "Points",
      columns: [
        { Header: "Total Points", accessor: "total_roster_points" },
        { Header: "Trailing", accessor: "trailing" },
        { Header: "Owes", accessor: "owes" },
        { Header: "Active Players", accessor: "active_players" }
      ]
    }
  ];
  return (
    <>
      <GridTitle title="Leaderboard" fixed={true} />
      <Table columns={columns} data={rosterTotalScores} />
      <ScoresUpdatedFooter poolId={pool_id} />
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
