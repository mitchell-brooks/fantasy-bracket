import { createClient } from '@utils/supabase-server';
import styles from './page.module.css';
import { PoolFullViewRow } from '@lib/api';
import Link from 'next/link';
import { formatPointValue } from '@/utils';
import * as api from '@lib/api';

export default async function PoolIdPage({
  params: { pool_id },
}: {
  params: { pool_id: number };
}) {
  const supabase = createClient();
  const user = await api.supabase.getUser(supabase);
  const user_id = user?.id;
  console.log('::: user_id', user_id);
  const { data: pool_data, error: pool_error } = await supabase
    .from('pool_full_view')
    .select('*')
    .eq('pool_id', pool_id);
  const {
    point_value,
    currency,
    pool_name,
    admin_username,
    identifier,
    round_count,
    daterange,
    league_unique,
    official_name,
    display_name,
    league_name,
    sport,
    total_draft_count,
    total_roster_count,
  } = (pool_data?.[0] as PoolFullViewRow) || {};
  const { data: roster_data, error: roster_error } = await supabase
    .from('roster')
    .select('roster_id')
    .eq('pool_id', pool_id)
    .eq('user_id', user_id);

  const roster_id = roster_data?.[0]?.roster_id;
  console.log('::: roster_id', roster_id, roster_data);

  const { data: draft_data, error } = await supabase
    .from('poolrule_draft')
    .select('*')
    .eq('pool_id', pool_id);
  const drafts = draft_data?.map((draft) => {
    return (
      <>
        <div className={styles.draftInstanceContainer}>
          <h2 className={styles.draftLink}>Draft {draft.draft_num}</h2>
          <div>
            <p>{new Date(draft.draft_time).toLocaleDateString()}</p>
            <p>{draft.roster_count} players</p>
          </div>
          <div>
            <Link href={`pool/${pool_id}/draft/${draft.draft_num}`}>
              Your Picks
            </Link>
          </div>
          <div>
            <Link href={`/pool/${pool_id}/draft/${draft.draft_num}/results`}>
              Draft Results
            </Link>
          </div>
        </div>
      </>
    );
  });
  return (
    <>
      <div className={styles.container}>
        <div className={styles.title}>
          <h1>{pool_name}</h1>
        </div>
        <div className={styles.meta}>
          <div className={styles.eventName}>
            <p>{`${display_name} ${identifier}`}</p>
          </div>
          <div className={styles.leaderboardLink}>
            <Link href={`/pool/${pool_id}/leaderboard`}>Leaderboard</Link>
          </div>
          <br />
          <div className={styles.leaderboardLink}>
            {roster_id ? (
              <Link href={`/pool/${pool_id}/roster/${roster_id}`}>
                Your Roster
              </Link>
            ) : null}
          </div>
          <br />
          <br />
          {admin_username ? <p>Admin: {admin_username}</p> : null}
          {point_value ? (
            <p>{formatPointValue(1, currency, point_value)} per point</p>
          ) : null}
          {total_draft_count ? (
            <p>
              {total_draft_count} draft{total_draft_count > 1 ? 's' : ''}
            </p>
          ) : null}
          {total_roster_count ? (
            <p>{total_roster_count} total players per roster</p>
          ) : null}
          {drafts ? (
            <>
              <div className={styles.draftContainer}>{drafts}</div>
            </>
          ) : null}
        </div>
      </div>
      <hr className={styles.divider} />
    </>
  );
}
