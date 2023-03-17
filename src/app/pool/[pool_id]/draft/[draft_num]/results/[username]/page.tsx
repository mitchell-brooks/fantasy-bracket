import React from 'react';
import { createClient } from '@utils/supabase-server';
import { Table } from '@components/table/table';

export default async function PoolIdDraftResultsDraftNumUsernamePage({
  params: { pool_id, draft_num = 1, username },
}: {
  params: { pool_id: string; draft_num: string | number; username: string };
}) {
  //TODO remove this hard coded value
  const participants = 9;
  draft_num = Number(draft_num);
  const supabase = createClient();
  const { data: draft_results_data, error } = await supabase
    .from('draft_results_view')
    .select('*')
    .eq('pool_id', pool_id)
    .eq('draft_num', draft_num);
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
          ...row,
        };
      }) || [];

  const columns = [
    {
      Header: 'Pick',
      columns: [
        { Header: 'Round', accessor: 'round' },
        { Header: 'Pick', accessor: 'pick_number' },
        { Header: 'User', accessor: 'username' },
      ],
    },
    {
      Header: 'Player',
      columns: [{ Header: 'Name', accessor: 'player_name' }],
    },
    {
      Header: 'Team',
      columns: [
        { Header: 'Team', accessor: 'team_name' },
        { Header: 'Seed', accessor: 'seed' },
      ],
    },
  ];
  return (
    <>
      <Table columns={columns} data={draftResults} />
    </>
  );
}
