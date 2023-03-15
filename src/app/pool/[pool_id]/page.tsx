import { createClient } from '@utils/supabase-server';
import { PoolFullViewRow } from '@lib/api';

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
  return (
    <>
      <h1>Pool Page</h1>
      <p>Pool ID: {pool_id}</p>
      <p>Pool Name: {pool_name}</p>
      {admin_username ? <p>Admin: {admin_username}</p> : null}
      <p>Event: {`${display_name} ${identifier}`}</p>
      {point_value ? (
        <p>
          {currency === 'cent'
            ? `$${point_value / 100}`
            : `${point_value} ${currency}`}
          per point
        </p>
      ) : null}
      {total_draft_count ? (
        <p>
          {total_draft_count} draft{total_draft_count > 1 ? 's' : ''}
        </p>
      ) : null}
      {total_roster_count ? <p>{total_roster_count} players</p> : null}
    </>
  );
}
