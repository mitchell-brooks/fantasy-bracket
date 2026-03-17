# Sportsipy Separation & Pipeline Reorganization

## Goal

Extract the ncaab parsing code from the sportsipy fork, separate HTTP transport from parsing, and consolidate the data pipeline into fantasy-bracket. The sportsipy fork at `~/code/sportsipy` gets archived. Three cleanly separated layers replace the current tangle.

## Context

The sportsipy fork currently mixes three concerns:
1. HTML parsing of basketball-reference pages into Python objects
2. AWS API Gateway IP rotation for rate-limit avoidance (spins up on import)
3. Tournament-specific data extraction scripts and configs

This coupling makes sportsipy unusable without AWS credentials, puts our extraction scripts in the wrong repo, and makes the pipeline fragile across years.

## Architecture

### Three Layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Scraper** | `data/pipeline/scraper/` | Parse basketball-reference HTML into Python objects. Accepts a `requests.Session` from the caller. No HTTP transport decisions. |
| **HTTP** | `data/pipeline/http.py` | Create a `requests.Session` with optional IP rotation (AWS API Gateway) and configurable retry/backoff. Manages gateway lifecycle. |
| **Pipeline** | `data/pipeline/` | CLI commands for pulling data and loading into Supabase. Config-driven. Produces manifest and log files. |

### Session Injection

The scraper exposes a `configure_session()` function. The pipeline creates a session (with or without IP rotation) and injects it before calling any scraper APIs:

```python
# pipeline/extraction.py
from pipeline.http import create_session, shutdown_session
from pipeline.scraper.utils import configure_session

session = create_session(config)
configure_session(session)
# all scraper calls now go through the configured session
# ...
shutdown_session(session)
```

The scraper's `_pull_page()` uses a module-level `_session` that defaults to a plain `requests.Session`, so the scraper works standalone without IP rotation.

### Directory Structure

```
data/
├── pipeline/
│   ├── __init__.py
│   ├── __main__.py              # python -m pipeline
│   ├── cli.py                   # argparse CLI
│   ├── config.py                # season config loader
│   ├── http.py                  # IP-rotating session factory + retry
│   ├── extraction.py            # tournament data pull orchestration
│   ├── loading.py               # Supabase data loading
│   ├── manifest.py              # run manifest + structured logging
│   ├── scraper/                 # vendored sportsipy ncaab parsing
│   │   ├── __init__.py          # public API: Teams, Team, Roster, Player
│   │   ├── utils.py             # parsing helpers only
│   │   ├── constants.py         # WIN, LOSS, HOME, AWAY
│   │   ├── decorators.py        # property decorators
│   │   └── ncaab/
│   │       ├── __init__.py
│   │       ├── constants.py     # URLs, parsing schemes
│   │       ├── ncaab_utils.py
│   │       ├── teams.py
│   │       ├── roster.py
│   │       ├── player.py
│   │       ├── schedule.py
│   │       ├── boxscore.py
│   │       ├── conferences.py
│   │       └── rankings.py
│   └── tests/
│       ├── test_http.py
│       ├── test_extraction.py
│       └── test_manifest.py
├── seasons/
│   ├── 2023.json
│   ├── 2024.json
│   ├── 2025.json
│   └── 2026.json
└── output/
    ├── 2023/
    │   ├── team_stats.csv
    │   ├── player_stats.csv
    │   ├── team_seeds.csv
    │   ├── rounds.csv
    │   ├── manifest.json
    │   ├── run.log
    │   ├── scores/
    │   └── schedules/
    ├── 2024/
    ├── 2025/
    └── 2026/
```

## HTTP Layer (`http.py`)

Creates a `requests.Session` based on config. When IP rotation is enabled, mounts the AWS API Gateway adapter. Wraps `session.get()` with retry logic that retries on 403 with configurable backoff.

Config:

```json
{
  "http": {
    "ip_rotation": true,
    "regions": ["us-east-1", "us-east-2", "..."],
    "retry": {
      "max_attempts": 5,
      "backoff_base_seconds": 3
    },
    "delay": {
      "between_teams": 3,
      "between_players": 0.5
    }
  }
}
```

When `ip_rotation` is false or omitted, returns a plain `requests.Session`. Retry and delay logic still apply.

The session lifecycle is explicit: `create_session()` returns the session, `shutdown_session()` tears down the gateway.

## Scraper Layer (`scraper/`)

The 13 files from sportsipy's ncaab module, vendored in-repo. Changes from upstream:

1. `scraper/utils.py` — split from the original `sportsipy/utils.py`. Contains only parsing helpers (`_parse_field`, `_get_stats_table`, `_remove_html_comment_tags`, `_find_year_for_season`). The `_pull_page()` function uses a configurable `_session` instead of the hardcoded `request_through_api_gateway`. IP rotation, retry, and rate limiting code removed.

2. Import paths updated from `sportsipy.*` to `pipeline.scraper.*`.

3. All other files unchanged in logic, only import paths adjusted.

Public API exposed via `scraper/__init__.py`:

```python
from pipeline.scraper.ncaab.teams import Teams, Team
from pipeline.scraper.ncaab.roster import Roster, Player
```

## Extraction Layer (`extraction.py`)

Orchestrates pulling data from basketball-reference. Replaces `pull_tournament_data.py` from the sportsipy repo.

CLI:

```
python -m pipeline pull --config seasons/2026.json
python -m pipeline pull --config seasons/2026.json --teams-only
python -m pipeline pull --config seasons/2026.json --players-only
python -m pipeline pull --config seasons/2026.json --retry-teams VILLANOVA
python -m pipeline pull --config seasons/2026.json --retry-players milos-uzan-1
```

## Loading Layer (`loading.py`)

Pushes CSVs into Supabase. Replaces `load_2026.py` and the `load-data.ipynb` functions.

CLI:

```
python -m pipeline load --config seasons/2026.json
python -m pipeline load --config seasons/2026.json --rounds-only
python -m pipeline load --config seasons/2026.json --teams-only
python -m pipeline load --config seasons/2026.json --players-only
```

Reads CSVs from `data/output/{year}/`, loads into Supabase using the competition_id from config.

## Observability (`manifest.py`)

Every `pull` run produces two artifacts in `data/output/{year}/`:

**Manifest** (`manifest.json`):

```json
{
  "run_timestamp": "2026-03-16T23:45:00",
  "config": "seasons/2026.json",
  "teams_expected": 68,
  "teams_succeeded": 67,
  "teams_failed": ["Villanova"],
  "players_total": 928,
  "players_failed": ["milos-uzan-1", "jalil-bethea-1"],
  "retry_commands": [
    "python -m pipeline pull --config seasons/2026.json --retry-teams Villanova",
    "python -m pipeline pull --config seasons/2026.json --retry-players milos-uzan-1 jalil-bethea-1"
  ],
  "output_files": {
    "team_stats": "team_stats.csv",
    "player_stats": "player_stats.csv"
  }
}
```

**Structured log** (`run.log`):

```
2026-03-16 23:01:02 INFO  team DUKE: 12 players
2026-03-16 23:01:28 WARN  player milos-uzan-1: 403 attempt 1, retrying in 3s
2026-03-16 23:01:37 ERROR player milos-uzan-1: all 5 attempts failed
```

The manifest is the primary artifact for checking run completeness.

## Season Config (`seasons/*.json`)

Each year gets a config file:

```json
{
  "year": 2026,
  "season": "2025-26",
  "competition_id": 8,
  "league": "ncaambb",
  "expected_teams": 68,
  "stats_thru": "2026-03-16",
  "output_dir": "output/2026",
  "teams": ["Duke", "Arizona", "Michigan", "..."],
  "http": {
    "ip_rotation": true,
    "retry": { "max_attempts": 5, "backoff_base_seconds": 3 },
    "delay": { "between_teams": 3, "between_players": 0.5 }
  }
}
```

## Data Migration

Existing data files move to the new structure:

- `data/2023/*.csv` → `data/output/2023/`
- `data/2024/*.csv` → `data/output/2024/`
- `data/2025/*.csv` → `data/output/2025/`
- `data/2026/*.csv` → `data/output/2026/`

Scores and schedules subdirectories preserved within each year.

## What Gets Archived

- `~/code/sportsipy` repo — archived, no longer needed
- `data/load_2026.py` — replaced by `pipeline load`
- `data/load-data.ipynb` — becomes thin wrapper importing from pipeline (per WS3 plan)
- `data/draft.ipynb`, `data/record-games.ipynb` — future pipeline commands (not in scope here)

## Dependencies

The pipeline package needs:

- `requests` — HTTP
- `requests-ip-rotator` — AWS API Gateway (optional, only when ip_rotation enabled)
- `pyquery` — HTML parsing (used by scraper)
- `pandas` — DataFrames
- `supabase` — database loading
- `python-dotenv` — env var loading

These are already in the project's Python dependencies.

## Relationship to WS3

This design implements the data loading portion of the WS3 pipeline plan (`docs/superpowers/plans/2026-03-15-ws3-pipeline.md`). It shares the same `data/pipeline/` package structure and CLI interface. The WS3 plan also covers draft logic and game recording extraction, which are out of scope here but will follow the same pattern.
