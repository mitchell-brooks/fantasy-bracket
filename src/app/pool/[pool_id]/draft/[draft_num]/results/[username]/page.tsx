// ABOUTME: Draft results filtered to a single user's picks
// ABOUTME: Shows the picks made by a specific participant in a draft round
import React from "react";
import { createClient } from "@utils/supabase-server";
import { Table } from "@components/table/table";

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
  const { data: draft_results_data, error } = await supabase
    .from("draft_results_view")
    .select("*")
    .eq("pool_id", pool_id)
    .eq("draft_num", draft_num);
  const draftResults =
    draft_results_data
      ?.filter((row) => row.username === username)
      .map((row) => {
        let round;
        if (row.pick_number) {
          round = Math.ceil(row.pick_number / participants);
        }
        return {
          round,
          ...row
        };
      }) || [];

  const columns = [
    {
      Header: "Pick",
      columns: [
        { Header: "Round", accessor: "round" },
        { Header: "Pick", accessor: "pick_number" },
        { Header: "User", accessor: "username" }
      ]
    },
    {
      Header: "Player",
      columns: [{ Header: "Name", accessor: "player_name" }]
    },
    {
      Header: "Team",
      columns: [
        { Header: "Team", accessor: "team_name" },
        { Header: "Seed", accessor: "seed" }
      ]
    }
  ];
  return (
    <>
      <Table columns={columns} data={draftResults} />
    </>
  );
}
