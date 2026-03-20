// ABOUTME: Schedule view with date tabs and game cards showing drafted player scoring
// ABOUTME: Client component handling date tab navigation and game display
'use client';

import { useState, useMemo } from 'react';
import type { GameWithPlayers } from '@lib/api/games';
import styles from './schedule.module.css';

interface ScheduleViewProps {
  games: GameWithPlayers[];
  gameDates: string[];
  defaultDate: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

export function ScheduleView({ games, gameDates, defaultDate }: ScheduleViewProps) {
  const [activeDate, setActiveDate] = useState(defaultDate);

  const gamesForDate = useMemo(
    () => games.filter((g) => g.game_date === activeDate),
    [games, activeDate]
  );

  return (
    <div>
      <div className={styles.tabs}>
        {gameDates.map((date) => (
          <button
            key={date}
            className={date === activeDate ? styles.tabActive : styles.tab}
            onClick={() => setActiveDate(date)}
          >
            {formatDate(date)}
          </button>
        ))}
      </div>

      <div className={styles.dateGames}>
        {gamesForDate.map((game) => {
          const hasDraftedPlayers = game.players.length > 0;
          const hasScoring = game.players.some((p) => p.points_scored != null);

          if (!hasDraftedPlayers) {
            return (
              <div key={game.game_id} className={styles.gameRow}>
                <span className={styles.gameTime}>{formatTime(game.game_time)}</span>
                <span className={styles.matchup}>
                  {game.team_1.team_name} vs {game.team_2.team_name}
                </span>
                <span className={styles.noPlayers}>(no drafted players)</span>
              </div>
            );
          }

          return (
            <div key={game.game_id} className={styles.gameCard}>
              <div className={styles.gameCardHeader}>
                {hasScoring ? (
                  <span className={styles.gameScore}>Final</span>
                ) : (
                  <span className={styles.gameTime}>{formatTime(game.game_time)}</span>
                )}
                <span className={styles.matchup}>
                  {game.team_1.team_name} vs {game.team_2.team_name}
                </span>
              </div>
              {[game.team_1, game.team_2].map((team) => {
                const teamPlayers = game.players
                  .filter((p) => p.team_unique === team.team_unique)
                  .sort((a, b) => (b.points_scored ?? 0) - (a.points_scored ?? 0));
                if (teamPlayers.length === 0) return null;
                return (
                  <div key={team.team_unique} className={styles.teamGroup}>
                    <span className={styles.teamName}>{team.team_name}</span>
                    {teamPlayers.map((player) => (
                      <div
                        key={player.player_unique}
                        className={player.is_current_user ? styles.playerOwn : styles.playerRow}
                      >
                        <span className={styles.playerName}>
                          {player.is_current_user ? '\u2605 ' : ''}
                          {player.player_name}
                          {player.points_scored != null && (
                            <span className={styles.pointsInline}> {player.points_scored} pts</span>
                          )}
                        </span>
                        <span className={player.is_current_user ? styles.playerOwnParticipant : styles.participantName}>
                          {player.is_current_user ? 'yours' : player.username}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
