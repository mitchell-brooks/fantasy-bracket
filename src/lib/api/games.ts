// ABOUTME: Game data fetching functions for schedule and widget features
// ABOUTME: Joins games, players, rosters, and scoring data for a pool's competition
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@lib/database.types';
import { assertDefined } from '@utils/index';

export interface GameWithPlayers {
  game_id: number;
  game_date: string;
  game_time: string | null;
  round_num: number;
  team_1: { team_unique: string; team_name: string };
  team_2: { team_unique: string; team_name: string };
  players: GamePlayer[];
}

export interface GamePlayer {
  player_unique: string;
  player_name: string;
  team_unique: string;
  team_name: string;
  username: string | null;
  roster_id: number | null;
  is_current_user: boolean;
  points_scored: number | null;
}

interface RawGame {
  game_id: number;
  game_date: string;
  game_time: string | null;
  round_num: number;
  team_1_id: string;
  team_2_id: string;
}

interface RawTeam {
  team_unique: string;
  team_name: string;
}

interface RawPlayerInGame {
  player_unique: string | null;
  game_id: number | null;
  team_unique: string | null;
}

interface RawPlayer {
  player_unique: string;
  player_name: string;
}

interface RawRosterEntry {
  player_unique: string | null;
  username: string | null;
  roster_id: number | null;
  user_id: string | null;
}

interface RawPlayerGame {
  game_id: number;
  player_unique: string;
  points: number;
}

/**
 * Pure function that assembles GameWithPlayers[] from raw query results.
 * Separated from I/O for testability.
 */
export function assembleGamesWithPlayers(
  games: RawGame[],
  teams: RawTeam[],
  playersInGames: RawPlayerInGame[],
  players: RawPlayer[],
  rosterData: RawRosterEntry[],
  playerGameData: RawPlayerGame[],
  user_id: string | undefined
): GameWithPlayers[] {
  const teamLookup = new Map(
    teams.map((t) => [t.team_unique, t.team_name])
  );

  const playerNameLookup = new Map(
    players.map((p) => [p.player_unique, p.player_name])
  );

  const rosterLookup = new Map(
    rosterData
      .filter((r): r is RawRosterEntry & { player_unique: string } => r.player_unique != null)
      .map((r) => [r.player_unique, r])
  );

  const scoringLookup = new Map(
    playerGameData.map((pg) => [`${pg.game_id}-${pg.player_unique}`, pg.points])
  );

  // Group players by game_id
  const playersByGame = new Map<number, RawPlayerInGame[]>();
  for (const pig of playersInGames) {
    if (pig.game_id == null) continue;
    const existing = playersByGame.get(pig.game_id) ?? [];
    existing.push(pig);
    playersByGame.set(pig.game_id, existing);
  }

  return games.map((game) => {
    const gamePlayers = playersByGame.get(game.game_id) ?? [];
    const enrichedPlayers: GamePlayer[] = gamePlayers
      .filter((p): p is RawPlayerInGame & { player_unique: string } => p.player_unique != null)
      .map((p) => {
        const rosterInfo = rosterLookup.get(p.player_unique);
        const pointsScored = scoringLookup.get(`${game.game_id}-${p.player_unique}`);
        return {
          player_unique: p.player_unique,
          player_name: playerNameLookup.get(p.player_unique) ?? p.player_unique,
          team_unique: p.team_unique ?? '',
          team_name: teamLookup.get(p.team_unique ?? '') ?? p.team_unique ?? '',
          username: rosterInfo?.username ?? null,
          roster_id: rosterInfo?.roster_id ?? null,
          is_current_user: user_id != null && rosterInfo?.user_id === user_id,
          points_scored: pointsScored ?? null,
        };
      })
      // Only include drafted players
      .filter((p) => p.username != null);

    return {
      game_id: game.game_id,
      game_date: game.game_date,
      game_time: game.game_time,
      round_num: game.round_num,
      team_1: {
        team_unique: game.team_1_id,
        team_name: teamLookup.get(game.team_1_id) ?? game.team_1_id,
      },
      team_2: {
        team_unique: game.team_2_id,
        team_name: teamLookup.get(game.team_2_id) ?? game.team_2_id,
      },
      players: enrichedPlayers,
    };
  });
}

/**
 * Fetch all games for a pool's competition, enriched with drafted player info.
 * Returns games sorted by date and time.
 */
export async function getGamesForPool(
  supabase: SupabaseClient<Database>,
  pool_id: number,
  user_id: string | undefined
): Promise<GameWithPlayers[]> {
  // 1. Get the competition_id for this pool
  const { data: poolData } = await supabase
    .from('pool')
    .select('competition_id')
    .eq('pool_id', pool_id)
    .limit(1);

  const competition_id = poolData?.[0]?.competition_id;
  if (competition_id == null) return [];

  // 2. Fetch all games for this competition
  const { data: games } = await supabase
    .from('game')
    .select('game_id, game_date, game_time, round_num, team_1_id, team_2_id')
    .eq('competition_id', competition_id)
    .order('game_date', { ascending: true })
    .order('game_time', { ascending: true });

  if (!games?.length) return [];

  // 3. Fetch team names
  const teamIds = new Set<string>();
  for (const g of games) {
    teamIds.add(g.team_1_id);
    teamIds.add(g.team_2_id);
  }
  const { data: teams } = await supabase
    .from('team')
    .select('team_unique, team_name')
    .in('team_unique', Array.from(teamIds));

  // 4. Fetch all players in games for this competition
  const { data: playersInGames } = await supabase
    .from('players_in_games_view')
    .select('player_unique, game_id, team_unique')
    .eq('competition_id', competition_id);

  // 5. Fetch player names
  const playerIds = (playersInGames ?? [])
    .map((p) => p.player_unique)
    .filter((id): id is string => id != null);
  const { data: players } = await supabase
    .from('player')
    .select('player_unique, player_name')
    .in('player_unique', playerIds);

  // 6. Fetch roster data — which players are drafted by whom
  const { data: rosterData } = await supabase
    .from('roster_player_total_scores_view')
    .select('player_unique, username, roster_id, user_id')
    .eq('pool_id', pool_id);

  // 7. Fetch per-game scoring
  const gameIds = games.map((g) => g.game_id);
  const { data: playerGameData } = await supabase
    .from('player_game')
    .select('game_id, player_unique, points')
    .in('game_id', gameIds);

  // 8. Assemble the result using pure function
  return assembleGamesWithPlayers(
    games,
    teams ?? [],
    playersInGames ?? [],
    players ?? [],
    rosterData ?? [],
    playerGameData ?? [],
    user_id
  );
}

/**
 * Filter games to today's date only.
 */
export function getTodaysGames(games: GameWithPlayers[]): GameWithPlayers[] {
  const today = new Date().toISOString().split('T')[0];
  return games.filter((g) => g.game_date === today);
}

/**
 * Get unique game dates sorted ascending.
 */
export function getGameDates(games: GameWithPlayers[]): string[] {
  const dates = new Set(games.map((g) => g.game_date));
  return Array.from(dates).sort();
}
