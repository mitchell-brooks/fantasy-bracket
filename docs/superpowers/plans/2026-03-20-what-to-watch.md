# What to Watch Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Today's Games widget to the pool page and a full tournament schedule page so users can see when their players are playing and how they scored.

**Architecture:** Server components fetch game data by joining `game`, `players_in_games_view`, `player_game`, `team`, and roster data. The pool page embeds a compact widget for today. The schedule page uses date-tab navigation (client component) with game cards showing drafted players and their scores.

**Tech Stack:** Next.js 15 Server Components, Supabase queries, CSS Modules

**Spec:** `docs/superpowers/specs/2026-03-20-what-to-watch-design.md`

---

## File Map

### Files to Create
- `src/components/todays-games/todays-games.tsx` — Today's Games widget (server component)
- `src/components/todays-games/todays-games.module.css` — Widget styles
- `src/app/pool/[pool_id]/schedule/page.tsx` — Schedule page server component (fetches all data)
- `src/app/pool/[pool_id]/schedule/schedule-view.tsx` — Client component with date tabs and game cards
- `src/app/pool/[pool_id]/schedule/schedule.module.css` — Schedule page styles
- `src/lib/api/games.ts` — Shared data fetching functions for game/player/roster joins

### Files to Modify
- `src/app/pool/[pool_id]/page.tsx` — Add Today's Games widget and "Schedule" nav link
- `src/lib/api/index.ts` — Re-export games module
- `src/lib/api/types.ts` — Add game-related type aliases if needed

---

## Chunk 1: Data Layer

Build the shared data fetching functions that both the widget and schedule page will use.

### Task 1: Create the games data module

**Files:**
- Create: `src/lib/api/games.ts`
- Modify: `src/lib/api/index.ts`

- [ ] **Step 1: Create `src/lib/api/games.ts`**

This module exports functions to fetch game data enriched with player/roster info for a given pool.

```typescript
// ABOUTME: Game data fetching functions for schedule and widget features
// ABOUTME: Joins games, players, rosters, and scoring data for a pool's competition
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@lib/database.types';

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
  points_scored: number | null;  // null if game hasn't happened yet
}

/**
 * Fetch all games for a pool's competition, enriched with drafted player info.
 * Returns games sorted by date and time.
 */
export async function getGamesForPool(
  supabase: SupabaseClient<Database>,
  pool_id: number,
  user_id: string | undefined
) {
  // 1. Get the competition_id for this pool
  const { data: poolData } = await supabase
    .from('pool')
    .select('competition_id')
    .eq('pool_id', pool_id)
    .limit(1);

  const competition_id = poolData?.[0]?.competition_id;
  if (!competition_id) return [];

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

  const teamLookup = new Map(
    (teams ?? []).map((t) => [t.team_unique, t.team_name])
  );

  // 4. Fetch all players in games for this competition
  const { data: playersInGames } = await supabase
    .from('players_in_games_view')
    .select('player_unique, game_id, team_unique')
    .eq('competition_id', competition_id);

  // 5. Fetch player names
  const playerIds = new Set(
    (playersInGames ?? []).map((p) => p.player_unique).filter(Boolean)
  );
  const { data: players } = await supabase
    .from('player')
    .select('player_unique, player_name')
    .in('player_unique', Array.from(playerIds));

  const playerNameLookup = new Map(
    (players ?? []).map((p) => [p.player_unique, p.player_name])
  );

  // 6. Fetch roster data — which players are drafted by whom
  const { data: rosterData } = await supabase
    .from('roster_player_total_scores_view')
    .select('player_unique, username, roster_id, user_id')
    .eq('pool_id', pool_id);

  const rosterLookup = new Map(
    (rosterData ?? []).map((r) => [r.player_unique, r])
  );

  // 7. Fetch per-game scoring
  const gameIds = games.map((g) => g.game_id);
  const { data: playerGameData } = await supabase
    .from('player_game')
    .select('game_id, player_unique, points')
    .in('game_id', gameIds);

  // Build a lookup: game_id+player_unique → points
  const scoringLookup = new Map(
    (playerGameData ?? []).map((pg) => [`${pg.game_id}-${pg.player_unique}`, pg.points])
  );

  // 8. Assemble the result
  // Group players by game_id
  const playersByGame = new Map<number, typeof playersInGames>();
  for (const pig of (playersInGames ?? [])) {
    if (pig.game_id == null) continue;
    const existing = playersByGame.get(pig.game_id) ?? [];
    existing.push(pig);
    playersByGame.set(pig.game_id, existing);
  }

  const result: GameWithPlayers[] = games.map((game) => {
    const gamePlayers = playersByGame.get(game.game_id) ?? [];
    const enrichedPlayers: GamePlayer[] = gamePlayers
      .filter((p) => p.player_unique != null)
      .map((p) => {
        const rosterInfo = rosterLookup.get(p.player_unique!);
        const pointsScored = scoringLookup.get(`${game.game_id}-${p.player_unique}`);
        return {
          player_unique: p.player_unique!,
          player_name: playerNameLookup.get(p.player_unique!) ?? p.player_unique!,
          team_unique: p.team_unique ?? '',
          team_name: teamLookup.get(p.team_unique ?? '') ?? p.team_unique ?? '',
          username: rosterInfo?.username ?? null,
          roster_id: rosterInfo?.roster_id ?? null,
          is_current_user: rosterInfo?.user_id === user_id,
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

  return result;
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
```

- [ ] **Step 2: Export from the API barrel**

Add to `src/lib/api/index.ts`:

```typescript
export * as games from './games';
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/lib/api/games.ts src/lib/api/index.ts
git commit -m "feat: add game data fetching module for schedule features"
```

---

## Chunk 2: Today's Games Widget

Build the compact widget that appears on the pool page.

### Task 2: Create the Today's Games widget

**Files:**
- Create: `src/components/todays-games/todays-games.tsx`
- Create: `src/components/todays-games/todays-games.module.css`
- Modify: `src/app/pool/[pool_id]/page.tsx`

- [ ] **Step 1: Create `todays-games.module.css`**

```css
/* ABOUTME: Styles for the Today's Games widget on the pool page */
/* ABOUTME: Compact game list with time, matchup, and player details */
.widget {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1.2rem 1.5rem;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius);
}

.widgetTitle {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  text-align: left;
}

.gameItem {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--color-border-subtle);
}

.gameItem:last-of-type {
  border-bottom: none;
}

.gameHeader {
  display: flex;
  gap: 1rem;
  align-items: baseline;
}

.gameTime {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-text-primary);
  min-width: 7rem;
}

.gameScore {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-text-primary);
  min-width: 7rem;
}

.matchup {
  font-size: 1.4rem;
  color: var(--color-text-primary);
}

.playerList {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding-left: 8rem;
}

.playerRow {
  font-size: 1.2rem;
  color: var(--color-text-muted);
  display: flex;
  justify-content: space-between;
}

.playerOwn {
  composes: playerRow;
  color: var(--color-text-primary);
  font-weight: 600;
}

.playerPoints {
  font-weight: 600;
  color: var(--color-accent-positive);
}

.scheduleLink {
  font-size: 1.3rem;
  color: var(--color-accent-primary);
  text-decoration: none;
  padding-top: 0.3rem;
}

.scheduleLink:hover {
  text-decoration: underline;
}
```

- [ ] **Step 2: Create `todays-games.tsx`**

This is a server component that receives pre-fetched game data.

```typescript
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
  // Only show games that have drafted players
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
```

- [ ] **Step 3: Add the widget to the pool page**

In `src/app/pool/[pool_id]/page.tsx`:

1. Import the data module and widget:
```typescript
import { getGamesForPool, getTodaysGames } from '@lib/api/games';
import { TodaysGames } from '@components/todays-games/todays-games';
```

2. After fetching roster data, fetch games:
```typescript
const allGames = await getGamesForPool(supabase, pool_id, user_id);
const todaysGames = getTodaysGames(allGames);
```

3. Add "Schedule" to the nav links:
```typescript
<Link href={`/pool/${pool_id}/schedule`} className={styles.navLink}>Schedule</Link>
```

4. Add the widget between the drafts section and the roster section:
```typescript
{todaysGames.length > 0 && (
  <TodaysGames games={todaysGames} pool_id={pool_id} />
)}
```

- [ ] **Step 4: Verify build and test manually**

Run: `npm run build`
Run: `npm run dev` — navigate to a pool page and verify widget appears (if there are games today)

- [ ] **Step 5: Commit**

```bash
git add src/components/todays-games/ src/app/pool/\[pool_id\]/page.tsx
git commit -m "feat: add Today's Games widget to pool page"
```

---

## Chunk 3: Full Schedule Page

Build the schedule page with date tabs and game cards.

### Task 3: Create the schedule page

**Files:**
- Create: `src/app/pool/[pool_id]/schedule/page.tsx`
- Create: `src/app/pool/[pool_id]/schedule/schedule-view.tsx`
- Create: `src/app/pool/[pool_id]/schedule/schedule.module.css`

- [ ] **Step 1: Create `schedule.module.css`**

Style the page with the same tabbed pattern as the All Players page. Game cards for games with drafted players are prominent (card with background/border). Games without drafted players are simple muted text rows.

Key classes needed:
- `.page` — flex column layout
- `.tabs` — date tab row (reuse pattern from players page)
- `.tab` / `.tabActive` — individual tabs
- `.gameCard` — prominent game card for games with drafted players
- `.gameCardHeader` — time/score + matchup
- `.gameRow` — muted row for games without drafted players
- `.playerRow` / `.playerOwn` — player lines within game cards
- `.pointsBadge` — per-game points display

- [ ] **Step 2: Create `schedule-view.tsx`**

Client component that receives all games and renders date tabs + game cards.

```typescript
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

export function ScheduleView({ games, gameDates, defaultDate }: ScheduleViewProps) {
  const [activeDate, setActiveDate] = useState(defaultDate);

  const gamesForDate = useMemo(
    () => games.filter((g) => g.game_date === activeDate),
    [games, activeDate]
  );

  // ... render date tabs and game cards
}
```

The component should:
- Render date tabs formatted as readable dates (e.g., "Mar 20", "Mar 21")
- Show game cards for the active date, sorted by game_time
- Games with drafted players: card with playerlist
- Games without drafted players: simple muted row
- For completed games: show "Final" and each player's points
- For upcoming games: show time
- User's own players marked with ★ and bold

- [ ] **Step 3: Create `schedule/page.tsx`**

Server component that fetches data and passes to ScheduleView.

```typescript
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
  const today = new Date().toISOString().split('T')[0];
  const defaultDate = gameDates.includes(today ?? '')
    ? today!
    : gameDates.find((d) => d >= (today ?? '')) ?? gameDates[0] ?? '';

  return (
    <div className={styles.page}>
      <h1>Schedule</h1>
      <ScheduleView
        games={games}
        gameDates={gameDates}
        defaultDate={defaultDate}
      />
    </div>
  );
}
```

- [ ] **Step 4: Verify build and test manually**

Run: `npm run build`
Run: `npm run dev` — navigate to `/pool/31/schedule`

Verify:
1. Date tabs appear for game days
2. Games for the selected date display
3. Games with drafted players show as cards with player lists
4. Games without drafted players show as muted rows
5. Completed games show "Final" and per-game points
6. User's own players are emphasized

- [ ] **Step 5: Commit and push**

```bash
git add src/app/pool/\[pool_id\]/schedule/
git commit -m "feat: add full tournament schedule page with date tabs and player scoring"
```

- [ ] **Step 6: Push and open PR**

```bash
git push -u origin staff/what-to-watch
gh pr create --title "feat: What to Watch — Today's Games widget and Schedule page" --body "$(cat <<'EOF'
## Summary
- Today's Games widget on pool page showing upcoming/completed games with drafted players
- Full schedule page at /pool/[pool_id]/schedule with date tab navigation
- Game cards show all drafted players with per-game scoring for completed games
- User's own players emphasized with ★ marker
- Games without drafted players shown as muted rows

## Test plan
- [ ] Today's Games widget appears on pool page when games exist today
- [ ] Widget shows user's players emphasized, other players muted
- [ ] Completed games show "Final" and per-game points
- [ ] Schedule page shows date tabs for game days
- [ ] Default date is today or nearest future game day
- [ ] Games with drafted players render as cards
- [ ] Games without drafted players render as muted rows
- [ ] Schedule link in pool page nav works

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
