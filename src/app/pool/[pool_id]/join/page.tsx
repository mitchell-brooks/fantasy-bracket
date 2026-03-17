// ABOUTME: Pool join page that lets authenticated users join a pool
// ABOUTME: Shows pool name and join button, redirects if already a member or not logged in
import { createClient } from '@utils/supabase-server';
import React from 'react';
import Link from 'next/link';
import { JoinButton } from '@components/join-button/join-button';
import { Redirect } from '@components/redirect/redirect';
import styles from './join.module.css';

export default async function PoolJoinPage({
  params,
}: {
  params: Promise<{ pool_id: string }>;
}) {
  const { pool_id: pool_id_param } = await params;
  const pool_id = Number(pool_id_param);
  const supabase = await createClient();
  const { data: user_data } = await supabase.auth.getUser();
  const user_id = user_data?.user?.id;

  if (!user_id) {
    return <Redirect to={`/login?return_to=/pool/${pool_id}/join`} />;
  }

  const { data: pool_meta } = await supabase
    .from('pool_full_view')
    .select('pool_name, display_name, season, point_value, currency, total_roster_count, total_draft_count, admin_username, sport, league_name')
    .eq('pool_id', pool_id)
    .limit(1);

  const pool = pool_meta?.[0];
  const poolName = pool?.pool_name ?? `Pool #${pool_id}`;
  const tournamentName = pool?.display_name;
  const season = pool?.season;
  const pointValue = pool?.point_value;
  const currency = pool?.currency;
  const participantCount = pool?.total_roster_count ?? 0;
  const draftCount = pool?.total_draft_count ?? 0;
  const admin = pool?.admin_username;

  const { data: existing_roster } = await supabase
    .from('roster')
    .select('roster_id')
    .eq('pool_id', pool_id)
    .eq('user_id', user_id)
    .limit(1);

  if (existing_roster && existing_roster.length > 0) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2>Already a member</h2>
          <p>You&apos;re already in <strong>{poolName}</strong>.</p>
          <Link href={`/pool/${pool_id}`} className={styles.goToPool}>Go to pool</Link>
          <Redirect to={`/pool/${pool_id}`} timeout={2000} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Join Pool</h2>
        <p className={styles.poolName}>{poolName}</p>
        {tournamentName && (
          <p className={styles.competition}>{tournamentName}{season ? ` ${season}` : ''}</p>
        )}
        <div className={styles.meta}>
          {admin && <div className={styles.metaRow}><span>Created by</span><span>{admin}</span></div>}
          {participantCount > 0 && <div className={styles.metaRow}><span>Participants</span><span>{participantCount}</span></div>}
          {draftCount > 0 && <div className={styles.metaRow}><span>Draft rounds</span><span>{draftCount}</span></div>}
          {pointValue != null && <div className={styles.metaRow}><span>Point value</span><span>{pointValue}{currency === 'cent' ? '\u00A2' : ` ${currency}`}</span></div>}
        </div>
        <JoinButton pool_id={pool_id} user_id={user_id} />
      </div>
    </div>
  );
}
