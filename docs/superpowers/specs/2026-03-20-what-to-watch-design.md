# What to Watch — Game Schedule & Player Tracking

## Context

During the tournament, users want to know when their players are playing so they can watch the right games. Currently there's no way to see this without checking external sources. Two features address this: a compact widget on the pool page for today's games, and a full schedule page for browsing all game days.

## Goals

1. Show users which games their players are in today, at a glance
2. Provide a full tournament schedule with their players highlighted
3. Show scoring results for completed games — all drafted players, not just yours
4. Make undrafted-player games visible but less prominent

## Non-Goals

- TV channel / broadcast info (data not available)
- Live score updates (no real-time subscriptions yet)
- Push notifications for upcoming games

---

## Data Source

`players_in_games_view` joins players to games with fields:
- `player_unique`, `team_unique`, `game_id`, `game_date`, `game_time`, `round_num`, `competition_id`

`game` table has:
- `game_id`, `game_date`, `game_time`, `team_1_id`, `team_2_id`, `round_num`, `competition_id`

`roster_player_total_scores_view` maps players to rosters/usernames.

`player_game` table (if it exists) would have per-game scoring. Need to verify this table has individual game point totals.

---

## Component 1: Today's Games Widget

**Location:** Pool detail page (`/pool/[pool_id]`), between the draft cards and the roster section.

**Visibility:** Only appears when games exist for today's date.

**Layout:**
```
┌─────────────────────────────────────────┐
│  Today's Games                          │
│                                         │
│  12:15 PM   Duke vs Kansas              │
│             ★ C. Boozer (yours)         │
│             ★ I. Evans (yours)          │
│             Z. Mayo (ross)              │
│                                         │
│  2:40 PM    Florida vs Texas Tech       │
│             ★ W. Clayton Jr. (yours)    │
│                                         │
│  7:10 PM    Houston vs Gonzaga          │
│             L. Cryer (Joe G)            │
│                                         │
│  View full schedule →                   │
└─────────────────────────────────────────┘
```

**Behavior:**
- Games sorted by `game_time`
- Each game shows: time, team matchup
- Below each game: drafted players in that game, with owner name
- User's own players emphasized (★ marker or bold + "yours")
- Other participants' players shown in muted text
- Games with no drafted players not shown in the widget
- "View full schedule" link at the bottom goes to `/pool/[pool_id]/schedule`

**For completed games today:**
- Show final score instead of time: "Duke 78 - Kansas 65"
- Show each drafted player's points scored in that game

---

## Component 2: Full Schedule Page

**Route:** `/pool/[pool_id]/schedule`

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  Schedule                                        │
│                                                  │
│  [Mar 20] [Mar 21] [Mar 22] [Mar 23] ...        │
│                                                  │
│  ┌─ 12:15 PM ─ Duke vs Kansas ────────────────┐ │
│  │  C. Boozer (emmett) ············· 22 pts    │ │
│  │  I. Evans (emmett) ·············· 9 pts     │ │
│  │  Z. Mayo (ross) ················· 18 pts    │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌─ 2:40 PM ─ Florida vs Texas Tech ─────────┐ │
│  │  W. Clayton Jr. (mitchell) ······ 28 pts   │ │
│  │  D. Williams (mitchell) ········· 15 pts   │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│    7:10 PM ─ Akron vs Bryant                     │
│    (no drafted players)                          │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Date tabs:**
- Only show dates that have games
- Default to today (or nearest future game day)
- Same tabbed chip pattern as the All Players page

**Game cards:**
- Games with drafted players: card style (background, border), prominent
- Games without drafted players: simple text row, muted
- Upcoming games: show game time
- Completed games: show final score (if available) or "Final"

**Player rows in game cards:**
- All drafted players from both teams in the game
- Player name, owner (username), points scored (for completed games)
- User's own players emphasized
- Sorted by points scored (completed) or team (upcoming)

---

## Files to Create

- `src/app/pool/[pool_id]/schedule/page.tsx` — Full schedule server component
- `src/app/pool/[pool_id]/schedule/schedule-grid.tsx` — Client component with date tabs and game cards
- `src/app/pool/[pool_id]/schedule/schedule.module.css` — Schedule page styles
- `src/components/todays-games/todays-games.tsx` — Today's Games widget (client component)
- `src/components/todays-games/todays-games.module.css` — Widget styles

## Files to Modify

- `src/app/pool/[pool_id]/page.tsx` — Add Today's Games widget and "Schedule" nav link
