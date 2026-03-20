// ABOUTME: Tournament schedule page showing all games with drafted player highlighting
// ABOUTME: Server component that fetches game data and renders the schedule view
import { createClient } from '@utils/supabase-server';
import { getGamesForPool, getGameDates } from '@lib/api/games';
import { getUser } from '@lib/api/supabase';
import { ScheduleView } from './schedule-view';
import styles from './schedule.module.css';

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ pool_id: string }>;
}) {
  const { pool_id: pool_id_param } = await params;
  const pool_id = Number(pool_id_param);
  const supabase = await createClient();
  const user = await getUser(supabase);

  const games = await getGamesForPool(supabase, pool_id, user?.id);
  const gameDates = getGameDates(games);

  // Default to today if it's a game day, otherwise nearest future game day
  const today = new Date().toISOString().split('T')[0] ?? '';
  const defaultDate = gameDates.includes(today)
    ? today
    : gameDates.find((d) => d >= today) ?? gameDates[0] ?? '';

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Schedule</h1>
      <ScheduleView
        games={games}
        gameDates={gameDates}
        defaultDate={defaultDate}
      />
    </div>
  );
}
