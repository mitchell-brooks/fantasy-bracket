// ABOUTME: Pool detail page showing pool metadata, inline roster, draft cards, and navigation
// ABOUTME: Embeds the user's roster AG Grid and draft action links for quick access
import { createClient } from '@utils/supabase-server';
import styles from './page.module.css';
import { PoolFullViewRow } from '@lib/api';
import Link from 'next/link';
import { formatPointValue } from '@/utils';
import * as api from '@lib/api';
import { RosterGrid } from './roster/[roster_id]/roster-grid';
import { getGamesForPool, getTodaysGames } from '@lib/api/games';
import { TodaysGames } from '@components/todays-games/todays-games';

export default async function PoolIdPage({
  params,
}: {
  params: Promise<{ pool_id: string }>;
}) {
  const { pool_id: pool_id_param } = await params;
  const pool_id = Number(pool_id_param);
  const supabase = await createClient();
  const user = await api.supabase.getUser(supabase);
  const user_id = user?.id;
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
  const { data: roster_data, error: roster_error } = user_id
    ? await supabase
        .from('roster')
        .select('roster_id')
        .eq('pool_id', pool_id)
        .eq('user_id', user_id)
    : { data: null, error: null };

  const roster_id = roster_data?.[0]?.roster_id;

  const { data: draft_data } = await supabase
    .from('poolrule_draft')
    .select('*')
    .eq('pool_id', pool_id)
    .order('draft_num', { ascending: true });

  // Check which drafts the user has submitted rankings for
  const { data: ranking_counts } = roster_id
    ? await supabase
        .from('rosterranking')
        .select('draft_num')
        .eq('roster_id', roster_id)
    : { data: null };

  const submittedDrafts = new Set(
    (ranking_counts ?? []).map((r) => r.draft_num)
  );

  // Determine upcoming drafts that need action
  const now = new Date();
  const upcomingDrafts = (draft_data ?? []).filter((d) => {
    const deadline = new Date(d.draft_time);
    return deadline > now;
  });

  // Show the earliest upcoming draft — always the next one chronologically
  const ctaDraft = upcomingDrafts[0] ?? null;
  const ctaHasSubmitted = ctaDraft ? submittedDrafts.has(ctaDraft.draft_num) : false;

  // Fetch roster data for inline display
  const { data: roster_player_data } = roster_id
    ? await supabase
        .from('roster_player_total_scores_view')
        .select('player_name, team_name, seed, total_player_points, pick_number, team_unique, username, round_eliminated')
        .eq('pool_id', pool_id)
        .eq('roster_id', roster_id)
    : { data: null };

  const allGames = await getGamesForPool(supabase, pool_id, user_id);
  const todaysGames = getTodaysGames(allGames);

  const rosterRows = (roster_player_data ?? [])
    .sort((a, b) => (a?.pick_number ?? 0) - (b?.pick_number ?? 0))
    .map((player) => ({
      player_name: player.player_name ?? '',
      total_player_points: player.total_player_points,
      team_name: player.team_name,
      team_unique: player.team_unique,
      seed: player.seed,
      pick_number: player.pick_number,
      round_eliminated: player.round_eliminated,
      pool_id,
    }));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>{pool_name}</h1>
        {display_name && <p className={styles.subtitle}>{display_name} {identifier ?? ''}</p>}
      </div>

      <div className={styles.topRow}>
        <div className={styles.meta}>
          {admin_username && (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Admin</span>
              <span className={styles.metaValue}>{admin_username}</span>
            </div>
          )}
          {point_value != null && (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Point value</span>
              <span className={styles.metaValue}>{formatPointValue(1, currency, point_value)}</span>
            </div>
          )}
          {total_draft_count != null && total_draft_count > 0 && (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Drafts</span>
              <span className={styles.metaValue}>{total_draft_count}</span>
            </div>
          )}
          {total_roster_count != null && total_roster_count > 0 && (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Players per roster</span>
              <span className={styles.metaValue}>{total_roster_count}</span>
            </div>
          )}
        </div>

        <nav className={styles.nav}>
          <Link href={`/pool/${pool_id}/leaderboard`} className={styles.navLink}>Leaderboard</Link>
          <Link href={`/pool/${pool_id}/players`} className={styles.navLink}>All Players</Link>
          <Link href={`/pool/${pool_id}/schedule`} className={styles.navLink}>Schedule</Link>
        </nav>
      </div>

      {ctaDraft && (
        <Link href={`/pool/${pool_id}/draft/${ctaDraft.draft_num}`} className={styles.ctaBanner}>
          <span className={styles.ctaText}>
            {ctaHasSubmitted
              ? `Edit your rankings for Draft ${ctaDraft.draft_num}`
              : `Set your rankings for Draft ${ctaDraft.draft_num}`}
          </span>
          <span className={styles.ctaDeadline}>
            Due {new Date(ctaDraft.draft_time).toLocaleDateString()} at{' '}
            {new Date(ctaDraft.draft_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
        </Link>
      )}

      {draft_data && draft_data.length > 0 && (
        <div className={styles.draftsSection}>
          <h2 className={styles.sectionTitle}>Drafts</h2>
          <div className={styles.draftCards}>
            {draft_data.map((draft) => {
              const isPast = new Date(draft.draft_time) <= now;
              const hasSubmitted = submittedDrafts.has(draft.draft_num);
              return (
                <div key={draft.draft_num} className={styles.draftCard}>
                  <div className={styles.draftCardHeader}>
                    <h3>Draft {draft.draft_num}</h3>
                    {isPast ? (
                      <span className={styles.badgeComplete}>Complete</span>
                    ) : hasSubmitted ? (
                      <span className={styles.badgeSubmitted}>Submitted</span>
                    ) : (
                      <span className={styles.badgePending}>Pending</span>
                    )}
                  </div>
                  <div className={styles.draftMeta}>
                    <span>{new Date(draft.draft_time).toLocaleDateString()}</span>
                    <span>{draft.roster_count} players</span>
                  </div>
                  <div className={styles.draftLinks}>
                    {!isPast && (
                      <Link href={`/pool/${pool_id}/draft/${draft.draft_num}`} className={styles.draftLink}>
                        {hasSubmitted ? 'Edit Rankings' : 'Set Rankings'}
                      </Link>
                    )}
                    <Link href={`/pool/${pool_id}/draft/${draft.draft_num}/results`} className={styles.draftLink}>
                      Draft Results
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {todaysGames.length > 0 && (
        <TodaysGames games={todaysGames} pool_id={pool_id} />
      )}

      {rosterRows.length > 0 && (
        <div className={styles.rosterSection}>
          <h2 className={styles.sectionTitle}>Your Roster</h2>
          <RosterGrid rows={rosterRows} />
        </div>
      )}
    </div>
  );
}
