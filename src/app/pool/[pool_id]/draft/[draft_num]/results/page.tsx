import React from "react";
import { createClient } from "@utils/supabase-server";
import { Table } from "@components/table/table";
import Link from "next/link";
import { GridTitle } from "@components/grid-title/grid-title";

export default async function PoolIdDraftNumResults({
                                                      params: { pool_id, draft_num = 1 }
                                                    }: {
  params: { pool_id: string; draft_num: string | number };
}) {
  //TODO remove this hard coded value
  const participants = pool_id === "14" ? 12 : 9;
  draft_num = Number(draft_num);
  const supabase = createClient();
  const { data: draft_results_data, error } = await supabase
    .from("draft_results_view")
    .select("*")
    .eq("pool_id", pool_id)
    .eq("draft_num", draft_num);
  const draftResults =
    draft_results_data?.map((row) => {
      let round;
      if (row.pick_number) {
        round = Math.ceil(row.pick_number / participants);
      }
      const username = (
        <Link
          href={`/pool/${pool_id}/draft/${draft_num}/results/${row.username}`}
        >
          {row.username}
        </Link>
      );
      return {
        round,
        ...row,
        username
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
      <GridTitle title={`Draft ${draft_num} Results`} />
      <Table columns={columns} data={draftResults} />
    </>
  );
}
