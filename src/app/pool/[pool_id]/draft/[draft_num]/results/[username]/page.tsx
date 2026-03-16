// ABOUTME: Single user's draft picks page filtered from the draft results view
// ABOUTME: Server component that shows one participant's picks via AG Grid
import React from "react";
import { createClient } from "@utils/supabase-server";
import { GridTitle } from "@components/grid-title/grid-title";
import { ResultsGrid } from "../results-grid";

export default async function PoolIdDraftResultsDraftNumUsernamePage({
  params,
}: {
  params: Promise<{ pool_id: string; draft_num?: string; username: string }>;
}) {
  const { pool_id: pool_id_param, draft_num: draft_num_param = '1', username } = await params;
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
    .eq("pool_id", pool_id)
    .eq("draft_num", draft_num);

  const resultRows = (draft_results_data || [])
    .filter((row) => row.username === username)
    .map((row) => ({
      round: row.pick_number && participants > 0
        ? Math.ceil(row.pick_number / participants)
        : null,
      pick_number: row.pick_number,
      username: row.username,
      player_name: row.player_name,
      team_name: row.team_name,
      seed: row.seed,
      pool_id,
      draft_num,
    }));

  const height = `${Math.max(250, resultRows.length * 48 + 56)}px`;

  return (
    <>
      <GridTitle title={`${username}'s Picks`} />
      <ResultsGrid rows={resultRows} />
    </>
  );
}
