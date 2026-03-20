// ABOUTME: Compact Today's Games widget showing upcoming and completed games for today
// ABOUTME: Highlights the current user's players and shows per-game scoring for completed games
import styles from './todays-games.module.css';
import Link from 'next/link';
import type { GameWithPlayers } from '@lib/api/games';

interface TodaysGamesProps {
  games: GameWithPlayers[];
  pool_id: number;
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return 'TBD';
  try {
    const date = new Date(`2000-01-01T${timeStr}`);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return timeStr;
  }
}

export function TodaysGames({ games, pool_id }: TodaysGamesProps) {
  const gamesWithPlayers = games.filter((g) => g.players.length > 0);

  if (gamesWithPlayers.length === 0) return null;

  return (
    <div className={styles.widget}>
      <h2 className={styles.widgetTitle}>Today&apos;s Games</h2>
      {gamesWithPlayers.map((game) => {
        const hasScoring = game.players.some((p) => p.points_scored != null);
        return (
          <div key={game.game_id} className={styles.gameItem}>
            <div className={styles.gameHeader}>
              {hasScoring ? (
                <span className={styles.gameScore}>Final</span>
              ) : (
                <span className={styles.gameTime}>{formatTime(game.game_time)}</span>
              )}
              <span className={styles.matchup}>
                {game.team_1.team_name} vs {game.team_2.team_name}
              </span>
            </div>
            <div className={styles.playerList}>
              {game.players
                .sort((a, b) => (b.points_scored ?? 0) - (a.points_scored ?? 0))
                .map((player) => (
                  <div
                    key={player.player_unique}
                    className={player.is_current_user ? styles.playerOwn : styles.playerRow}
                  >
                    <span>
                      {player.is_current_user ? '★ ' : ''}
                      {player.player_name} ({player.is_current_user ? 'yours' : player.username})
                    </span>
                    {player.points_scored != null && (
                      <span className={styles.playerPoints}>{player.points_scored} pts</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        );
      })}
      <Link href={`/pool/${pool_id}/schedule`} className={styles.scheduleLink}>
        View full schedule →
      </Link>
    </div>
  );
}
