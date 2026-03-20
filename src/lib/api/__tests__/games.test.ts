// ABOUTME: Tests for game data utility functions (getTodaysGames, getGameDates, assembleGamesWithPlayers)
// ABOUTME: Validates date filtering, date extraction, and player/roster data enrichment logic
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getTodaysGames,
  getGameDates,
  assembleGamesWithPlayers,
  type GameWithPlayers,
} from '../games';
import { assertDefined } from '@utils/index';

function makeGame(overrides: Partial<GameWithPlayers> = {}): GameWithPlayers {
  return {
    game_id: 1,
    game_date: '2026-03-20',
    game_time: '12:00:00',
    round_num: 1,
    team_1: { team_unique: 'duke', team_name: 'Duke' },
    team_2: { team_unique: 'kansas', team_name: 'Kansas' },
    players: [],
    ...overrides,
  };
}

describe('getTodaysGames', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-20T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns games matching today\'s date', () => {
    const games = [
      makeGame({ game_id: 1, game_date: '2026-03-20' }),
      makeGame({ game_id: 2, game_date: '2026-03-21' }),
      makeGame({ game_id: 3, game_date: '2026-03-20' }),
    ];
    const result = getTodaysGames(games);
    expect(result).toHaveLength(2);
    expect(result.map((g) => g.game_id)).toEqual([1, 3]);
  });

  it('returns empty array when no games today', () => {
    const games = [
      makeGame({ game_id: 1, game_date: '2026-03-21' }),
    ];
    expect(getTodaysGames(games)).toEqual([]);
  });

  it('returns empty array for empty input', () => {
    expect(getTodaysGames([])).toEqual([]);
  });
});

describe('getGameDates', () => {
  it('returns unique sorted dates', () => {
    const games = [
      makeGame({ game_date: '2026-03-22' }),
      makeGame({ game_date: '2026-03-20' }),
      makeGame({ game_date: '2026-03-22' }),
      makeGame({ game_date: '2026-03-21' }),
    ];
    expect(getGameDates(games)).toEqual([
      '2026-03-20',
      '2026-03-21',
      '2026-03-22',
    ]);
  });

  it('returns empty array for empty input', () => {
    expect(getGameDates([])).toEqual([]);
  });
});

describe('assembleGamesWithPlayers', () => {
  const games = [
    {
      game_id: 1,
      game_date: '2026-03-20',
      game_time: '12:00:00',
      round_num: 1,
      team_1_id: 'duke',
      team_2_id: 'kansas',
    },
    {
      game_id: 2,
      game_date: '2026-03-20',
      game_time: '14:00:00',
      round_num: 1,
      team_1_id: 'florida',
      team_2_id: 'texas-tech',
    },
  ];

  const teams = [
    { team_unique: 'duke', team_name: 'Duke' },
    { team_unique: 'kansas', team_name: 'Kansas' },
    { team_unique: 'florida', team_name: 'Florida' },
    { team_unique: 'texas-tech', team_name: 'Texas Tech' },
  ];

  const playersInGames = [
    { player_unique: 'p1', game_id: 1, team_unique: 'duke' },
    { player_unique: 'p2', game_id: 1, team_unique: 'kansas' },
    { player_unique: 'p3', game_id: 2, team_unique: 'florida' },
  ];

  const players = [
    { player_unique: 'p1', player_name: 'Cooper Flagg' },
    { player_unique: 'p2', player_name: 'Hunter Dickinson' },
    { player_unique: 'p3', player_name: 'Walter Clayton Jr.' },
  ];

  const rosterData = [
    { player_unique: 'p1', username: 'mitchell', roster_id: 10, user_id: 'user-1' },
    { player_unique: 'p3', username: 'ross', roster_id: 11, user_id: 'user-2' },
  ];

  const playerGameData = [
    { game_id: 1, player_unique: 'p1', points: 22 },
  ];

  it('assembles games with enriched player data', () => {
    const result = assembleGamesWithPlayers(
      games, teams, playersInGames, players, rosterData, playerGameData, 'user-1'
    );

    expect(result).toHaveLength(2);

    // Game 1: Duke vs Kansas
    const game1 = assertDefined(result[0], 'expected game 1');
    expect(game1.team_1.team_name).toBe('Duke');
    expect(game1.team_2.team_name).toBe('Kansas');
    // Only p1 is drafted (p2 has no roster entry)
    expect(game1.players).toHaveLength(1);
    const game1Player = assertDefined(game1.players[0], 'expected player in game 1');
    expect(game1Player.player_name).toBe('Cooper Flagg');
    expect(game1Player.username).toBe('mitchell');
    expect(game1Player.is_current_user).toBe(true);
    expect(game1Player.points_scored).toBe(22);

    // Game 2: Florida vs Texas Tech
    const game2 = assertDefined(result[1], 'expected game 2');
    expect(game2.players).toHaveLength(1);
    const game2Player = assertDefined(game2.players[0], 'expected player in game 2');
    expect(game2Player.player_name).toBe('Walter Clayton Jr.');
    expect(game2Player.username).toBe('ross');
    expect(game2Player.is_current_user).toBe(false);
    expect(game2Player.points_scored).toBeNull();
  });

  it('excludes undrafted players', () => {
    const result = assembleGamesWithPlayers(
      games, teams, playersInGames, players, [], playerGameData, 'user-1'
    );

    // No roster data means no drafted players
    for (const game of result) {
      expect(game.players).toHaveLength(0);
    }
  });

  it('handles missing team names gracefully', () => {
    const result = assembleGamesWithPlayers(
      games, [], playersInGames, players, rosterData, playerGameData, 'user-1'
    );

    // Should fall back to team_unique as name
    const firstGame = assertDefined(result[0], 'expected first game');
    expect(firstGame.team_1.team_name).toBe('duke');
    expect(firstGame.team_1.team_unique).toBe('duke');
  });

  it('handles null player_unique in playersInGames', () => {
    const pigWithNulls = [
      ...playersInGames,
      { player_unique: null, game_id: 1, team_unique: 'duke' },
    ];
    const result = assembleGamesWithPlayers(
      games, teams, pigWithNulls, players, rosterData, playerGameData, 'user-1'
    );

    // Should still work, skipping the null entry
    expect(assertDefined(result[0], 'expected game').players).toHaveLength(1);
  });

  it('handles null game_id in playersInGames', () => {
    const pigWithNulls = [
      ...playersInGames,
      { player_unique: 'p1', game_id: null, team_unique: 'duke' },
    ];
    const result = assembleGamesWithPlayers(
      games, teams, pigWithNulls, players, rosterData, playerGameData, 'user-1'
    );

    // Should skip null game_id entries
    expect(assertDefined(result[0], 'expected game').players).toHaveLength(1);
  });

  it('handles undefined user_id', () => {
    const result = assembleGamesWithPlayers(
      games, teams, playersInGames, players, rosterData, playerGameData, undefined
    );

    // No player should be marked as current user
    for (const game of result) {
      for (const player of game.players) {
        expect(player.is_current_user).toBe(false);
      }
    }
  });

  it('returns empty array for empty games', () => {
    const result = assembleGamesWithPlayers(
      [], teams, playersInGames, players, rosterData, playerGameData, 'user-1'
    );
    expect(result).toEqual([]);
  });
});
