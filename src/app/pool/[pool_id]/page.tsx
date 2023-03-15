import { createClient } from '@utils/supabase-server';
import styles from './page.module.css';
import { PoolFullViewRow } from '@lib/api';
import Link from 'next/link';

export default async function PoolIdPage({
  params: { pool_id },
}: {
  params: { pool_id: number };
}) {
  const supabase = createClient();
  const { data: pool_data, error: pool_error } = await supabase
    .from('pool_full_view')
    .select('*')
    .eq('pool_id', pool_id);
  console.log(pool_data);
  const {
    point_value,
    currency,
    poolmeta_id,
    pool_name,
    admin_user_id,
    admin_username,
    competition_unique,
    season,
    identifier,
    round_count,
    daterange,
    league_unique,
    official_name,
    display_name,
    league_name,
    sport,
    womens,
    total_draft_count,
    total_roster_count,
  } = (pool_data?.[0] as PoolFullViewRow) || {};
  const { data: draft_data, error } = await supabase
    .from('poolrule_draft')
    .select('*')
    .eq('pool_id', pool_id);
  const drafts = draft_data?.map((draft) => {
    return (
      <>
        <Link href={`pool/${pool_id}/draft/${draft.draft_num}`}>
          Draft {draft.draft_num}
        </Link>
        <p>{new Date(draft.draft_time).toLocaleDateString()}</p>
        <p>{draft.roster_count} players</p>
        <br />
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
          {admin_username ? <p>Admin: {admin_username}</p> : null}
          {point_value ? (
            <p>
              {currency === 'cent'
                ? `$${point_value / 100} `
                : `${point_value} ${currency} `}
              per point
            </p>
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
              <div className={styles.draftHeader}>
                <p>Draft Schedule</p>
              </div>
              <div className={styles.draftContainer}>{drafts}</div>
            </>
          ) : null}
        </div>
      </div>
      <hr className={styles.divider} />
    </>
  );
}
