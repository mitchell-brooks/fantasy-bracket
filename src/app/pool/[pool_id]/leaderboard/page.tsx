import React from 'react';
import styles from './page.module.css';
import { createClient } from '@utils/supabase-server';
import { Table } from '@components/table/table';
import Link from 'next/link';
import { formatPointValue } from '@/utils';
import { GridTitle } from '@components/grid-title/grid-title';

export default async function PoolIdDraftNumResults({
  params: { pool_id, draft_num = 1 },
}: {
  params: { pool_id: string; draft_num: string | number };
}) {
  //TODO remove this hard coded value
  const COMPETITION_ID = 1;
  draft_num = Number(draft_num);
  const supabase = createClient();
  const { data: roster_total_score_data, error } = await supabase
    .from('roster_total_score_view')
    .select('*, userprofile(username)')
    .eq('pool_id', pool_id);

  const { data: pool_data, error: poolmeta_error } = await supabase
    .from('pool')
    .select('*')
    .eq('pool_id', pool_id);

  const currency = pool_data?.[0]?.currency || 'cent';
  const point_value = pool_data?.[0]?.point_value || 1;

  const { data: updated_data, error: updated_error } = await supabase
    .from('competition_updated')
    .select('*')
    .eq('competition_id', COMPETITION_ID);
  const updated = updated_data?.[updated_data.length - 1]?.scores_updated_at
    ? new Date(
        updated_data?.[updated_data.length - 1]?.scores_updated_at
      ).toLocaleTimeString('en-US', { timeZone: 'America/New_York' })
    : 'N/A';

  const sortedRosterData = roster_total_score_data?.sort(
    (a, b) => (b?.total_roster_points || 0) - (a?.total_roster_points || 0)
  );

  const highestScore = sortedRosterData?.[0]?.total_roster_points || 0;
  let totalWinnings = 0;

  const rosterTotalScores =
    sortedRosterData?.map((row) => {
      let username;
      if (row?.userprofile) {
        if (Array.isArray(row?.userprofile)) {
          username = (
            <Link href={`/pool/${pool_id}/roster/${row.roster_id}`}>
              {row?.userprofile?.[0]?.username}
            </Link>
          );
        } else {
          username = (
            <Link href={`/pool/${pool_id}/roster/${row.roster_id}`}>
              {row?.userprofile?.username}
            </Link>
          );
        }
      }
      const trailing = highestScore - (row?.total_roster_points || 0);
      totalWinnings += trailing;
      const owes = formatPointValue(trailing, currency, point_value);
      return { username, trailing, owes, ...row };
    }) || [];

  const columns = [
    {
      Header: 'Participant',
      columns: [{ Header: 'Username', accessor: 'username' }],
    },
    {
      Header: 'Points',
      columns: [
        { Header: 'Total Points', accessor: 'total_roster_points' },
        { Header: 'Trailing', accessor: 'trailing' },
        { Header: 'Owes', accessor: 'owes' },
      ],
    },
  ];
  return (
    <>
      <GridTitle title="Leaderboard" />
      <Table columns={columns} data={rosterTotalScores} />
      <div className={styles.bottomContainer}>
        <div className={styles.updated}>
          <div>Scores Updated: {updated}</div>
        </div>
      </div>
      <div className={styles.total}>
        <div className={styles.totalColumn}>
          <h1 className={styles.prizeSplitTitle}>Prize Split</h1>
          <div>
            First place:{' '}
            {formatPointValue(totalWinnings * 0.75, currency, point_value)}
          </div>
          <div>
            Second place:{' '}
            {formatPointValue(totalWinnings * 0.25, currency, point_value)}
          </div>
        </div>
      </div>
    </>
  );
}
