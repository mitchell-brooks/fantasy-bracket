# Fantasy Bracket Data Pipeline

CLI tool for managing NCAA tournament data in the Bracketude fantasy bracket app.

## Setup

```bash
cd data
poetry install
```

Requires Supabase credentials in `.env.local` at the project root, or as environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_SUPABASE_SERVICE_ROLE_KEY`

## Season Configuration

Each season has a TOML config file in `data/seasons/`. To set up a new season:

1. Copy the previous year's config: `cp data/seasons/2025.toml data/seasons/2026.toml`
2. Update the values (competition_id, pool_id, year, etc.)
3. Competition and pool must be created in Supabase first

## Commands

All commands are run from the `data/` directory:

### Load tournament data (teams, players, rounds)
```bash
python -m pipeline load-data --season 2026
```
Requires CSV files in `data/2026/`:
- `rounds-2026-ncaa-tournament.csv`
- `2026_ncaa_tournament_team_stats.csv`
- `2026_ncaa_tournament_team_seeds.csv`
- `2026_ncaa_tournament_player_stats.csv`

### Import game schedule for a round
```bash
python -m pipeline update-schedule --round 1 --season 2026
```
Requires: `data/2026/schedules/game-schedule-round-1-2026-ncaa-tournament.csv`

### Generate blank scoring sheet for a game day
```bash
python -m pipeline generate-scoring-sheet --date 2026-03-19 --season 2026
```
Creates: `data/2026/scores/2026-03-19-game-scoring-2026-ncaa-tournament.csv`

### Record game scores (after filling in the scoring sheet)
```bash
python -m pipeline record-scores --date 2026-03-19 --round 1 --season 2026
```

### Run the draft
```bash
python -m pipeline run-draft --pool 20 --draft-num 1 --strategy TOURNAMENT_POINTS
```
Strategies: RANDOM, TOURNAMENT_POINTS, RANDOM_WITH_POINTS

### Maintain rosters (drop inactive, fill empty slots)
```bash
python -m pipeline maintain-rosters --pool 20 --draft-num 2 --strategy TOURNAMENT_POINTS
```

## Typical Tournament Workflow

1. **Before tournament**: `load-data`, `update-schedule` for round 1
2. **Each game day**:
   - `generate-scoring-sheet` for today's date
   - Fill in the CSV with actual scores
   - `record-scores` to push results to database
3. **Between rounds**: `update-schedule` for next round
4. **Draft days**: `run-draft` or `maintain-rosters`

## Testing

```bash
cd data && python -m pytest pipeline/tests/ -v
```
