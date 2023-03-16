import React from 'react';
import { createClient } from '@utils/supabase-server';
import { Table } from '@components/table/table';
import Link from 'next/link';

export default async function PoolIdDraftNumResults({
  params: { pool_id, draft_num = 1 },
}: {
  params: { pool_id: string; draft_num: string | number };
}) {
  draft_num = Number(draft_num);
  const supabase = createClient();
  const { data: roster_total_score_data, error } = await supabase
    .from('roster_total_score_view')
    .select('*, userprofile(username)')
    .eq('pool_id', pool_id);

  console.log(roster_total_score_data);

  const rosterTotalScores =
    roster_total_score_data
      ?.sort(
        (a, b) => (b?.total_roster_points || 0) - (a?.total_roster_points || 0)
      )
      .map((row) => {
        let username;
        if (row?.userprofile) {
          if (Array.isArray(row?.userprofile)) {
            username = row?.userprofile?.[0]?.username;
          } else {
            username = row?.userprofile?.username;
          }
        }
        return { username, ...row };
      }) || [];

  const columns = [
    {
      Header: 'Participant',
      columns: [{ Header: 'Username', accessor: 'username' }],
    },
    {
      Header: 'Points',
      columns: [{ Header: 'Total Points', accessor: 'total_roster_points' }],
    },
  ];
  return (
    <>
      <Table columns={columns} data={rosterTotalScores} />
    </>
  );
}
