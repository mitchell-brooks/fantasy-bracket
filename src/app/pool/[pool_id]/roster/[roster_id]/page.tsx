// ABOUTME: Individual roster detail page showing a participant's drafted players
// ABOUTME: Server component that fetches roster data and renders via AG Grid
import React from "react";
import { createClient } from "@utils/supabase-server";
import { GridTitle } from "@components/grid-title/grid-title";
import { RosterGrid } from "./roster-grid";

export default async function PoolIdDraftResultsDraftNumUsernamePage({
  params,
}: {
  params: Promise<{ pool_id: string; roster_id: string }>;
}) {
  const { pool_id: pool_id_param, roster_id: roster_id_param } = await params;
  const pool_id = Number(pool_id_param);
  const roster_id = Number(roster_id_param);
  const supabase = await createClient();
  const { data: roster_data_results } = await supabase
    .from("roster_player_total_scores_view")
    .select(
      "player_name, team_name, seed, total_player_points, pick_number, team_unique, username, round_eliminated"
    )
    .eq("pool_id", pool_id)
    .eq("roster_id", roster_id);

  const username = roster_data_results?.[0]?.username as string;

  const rosterRows = (roster_data_results || [])
    .sort((a, b) => (a?.pick_number || 0) - (b?.pick_number || 0))
    .map((player) => ({
      player_name: player.player_name || '',
      total_player_points: player.total_player_points,
      team_name: player.team_name,
      team_unique: player.team_unique,
      seed: player.seed,
      pick_number: player.pick_number,
      round_eliminated: player.round_eliminated,
      pool_id,
    }));

  return (
    <>
      <GridTitle title={username ? `${username.toUpperCase()}` : "Roster"} />
      <RosterGrid rows={rosterRows} />
    </>
  );
}
