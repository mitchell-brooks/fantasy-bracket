// ABOUTME: Full player data page showing all drafted players with detailed info
// ABOUTME: Server component that fetches draft results and renders via AG Grid
import React from "react";
import { createClient } from "@utils/supabase-server";
import { GridTitle } from "@components/grid-title/grid-title";
import { DataGridView } from "./data-grid-view";

export default async function PoolIdDraftNumResults({
  params,
}: {
  params: Promise<{ pool_id: string; draft_num?: string }>;
}) {
  const { pool_id: pool_id_param, draft_num: draft_num_param = '1' } = await params;
  const pool_id = Number(pool_id_param);
  const draft_num = Number(draft_num_param);
  const supabase = await createClient();
  const { data: rosters } = await supabase
    .from('roster')
    .select('roster_id')
    .eq('pool_id', pool_id);
  const participants = rosters?.length ?? 0;
  const { data: draft_results_data } = await supabase
    .from("draft_results_view")
    .select("*")
    .eq("pool_id", pool_id);

  const dataRows = (draft_results_data || []).map((row) => ({
    player_unique: row.player_unique,
    player_name: row.player_name,
    team_name: row.team_name,
    seed: row.seed,
    round: row.pick_number && participants > 0
      ? Math.ceil(row.pick_number / participants)
      : null,
    pick_number: row.pick_number,
    username: row.username,
    pool_id,
    draft_num,
  }));

  return (
    <>
      <GridTitle title="Player Data" />
      <DataGridView rows={dataRows} />
    </>
  );
}
