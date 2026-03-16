# WS3: Python Data Pipeline Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract Jupyter notebook code into importable Python modules with a CLI, parameterize hardcoded values via season config files, and fix known bugs — so tournament data management is reliable and agent-discoverable.

**Architecture:** Python package (`pipeline`) in the `data/` directory with a CLI entry point. Season-specific configuration in TOML files. Notebooks become thin wrappers that import from the package. Supabase client shared across modules.

**Tech Stack:** Python 3.9+, Poetry, Supabase Python SDK, argparse, tomllib (Python 3.11+) or tomli

**Spec:** `docs/superpowers/specs/2026-03-15-pre-tournament-improvements-design.md` (WS3 section)

---

## File Map

### Files to Create
- `data/pipeline/__init__.py` — Package init
- `data/pipeline/__main__.py` — `python -m pipeline` entry point
- `data/pipeline/cli.py` — CLI command definitions with argparse
- `data/pipeline/config.py` — Season configuration loader
- `data/pipeline/supabase_client.py` — Shared Supabase client initialization
- `data/pipeline/data_loading.py` — Team, player, round, conference loading
- `data/pipeline/game_recording.py` — Schedule import, scoring sheet generation, score recording
- `data/pipeline/draft.py` — Draft logic, autodraft, roster maintenance
- `data/pipeline/README.md` — Agent-readable documentation of all commands
- `data/seasons/2025.toml` — Season config for 2025 (reference)
- `data/seasons/2026.toml` — Season config for 2026 (to be filled)
- `data/pipeline/tests/__init__.py`
- `data/pipeline/tests/test_config.py` — Config loading tests
- `data/pipeline/tests/test_draft.py` — Draft logic unit tests
- `data/pipeline/tests/test_game_recording.py` — Game recording tests

### Files to Modify
- `data/pyproject.toml` — Add pipeline package, update dependencies
- `data/draft.ipynb` — Thin wrapper importing from pipeline
- `data/record-games.ipynb` — Thin wrapper importing from pipeline
- `data/load-data.ipynb` — Thin wrapper importing from pipeline

---

## Chunk 1: Package Setup & Configuration

### Task 1: Create the pipeline package structure

**Files:**
- Create: `data/pipeline/__init__.py`
- Create: `data/pipeline/__main__.py`
- Modify: `data/pyproject.toml`

- [ ] **Step 1: Create a working branch**

```bash
git checkout -b staff/ws3-pipeline
```

- [ ] **Step 2: Create package directory structure**

```bash
mkdir -p data/pipeline/tests
touch data/pipeline/__init__.py
touch data/pipeline/tests/__init__.py
```

- [ ] **Step 3: Create __main__.py entry point**

```python
# data/pipeline/__main__.py
# ABOUTME: Entry point for running the pipeline as a module
# ABOUTME: Usage: python -m pipeline --help
from pipeline.cli import main

if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Update pyproject.toml**

Add the pipeline package. Read the existing `data/pyproject.toml` first to understand the current setup, then add:

```toml
[tool.poetry.scripts]
pipeline = "pipeline.cli:main"
```

Also ensure `tomli` is in dependencies (for Python < 3.11 TOML support):
```bash
cd data && poetry add tomli
```

- [ ] **Step 5: Commit**

```bash
git add data/pipeline/ data/pyproject.toml
git commit -m "chore: create pipeline package structure"
```

---

### Task 2: Build the configuration system

**Files:**
- Create: `data/pipeline/config.py`
- Create: `data/seasons/2025.toml`
- Create: `data/pipeline/tests/test_config.py`

- [ ] **Step 1: Write failing test for config loading**

```python
# data/pipeline/tests/test_config.py
# ABOUTME: Tests for season configuration loading
# ABOUTME: Verifies TOML parsing and config validation
import pytest
from pipeline.config import load_season_config, SeasonConfig


def test_load_valid_config(tmp_path):
    """Loading a valid TOML config returns a SeasonConfig object."""
    config_file = tmp_path / "2025.toml"
    config_file.write_text("""
[competition]
id = 6
unique = "ncaambb-d1-championship"
season = "2024-25"
year = 2025
round_count = 7
expected_teams = 68

[pool]
id = 19
name = "March Radness 2025"

[paths]
data_dir = "data/2025"
""")
    config = load_season_config(str(config_file))
    assert config.competition_id == 6
    assert config.pool_id == 19
    assert config.year == 2025
    assert config.data_dir == "data/2025"
    assert config.expected_teams == 68


def test_load_missing_file():
    """Loading a nonexistent config file raises FileNotFoundError."""
    with pytest.raises(FileNotFoundError):
        load_season_config("nonexistent.toml")


def test_load_invalid_config(tmp_path):
    """Loading a config with missing required fields raises ValueError."""
    config_file = tmp_path / "bad.toml"
    config_file.write_text("[competition]\nid = 1\n")
    with pytest.raises((KeyError, ValueError)):
        load_season_config(str(config_file))
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd data && python -m pytest pipeline/tests/test_config.py -v
```
Expected: FAIL — module not found

- [ ] **Step 3: Implement config.py**

```python
# data/pipeline/config.py
# ABOUTME: Loads and validates season configuration from TOML files
# ABOUTME: Each season has a TOML config with competition, pool, and path settings
import sys
from dataclasses import dataclass
from pathlib import Path

if sys.version_info >= (3, 11):
    import tomllib
else:
    try:
        import tomli as tomllib
    except ImportError:
        raise ImportError("Install tomli for Python < 3.11: pip install tomli")


@dataclass(frozen=True)
class SeasonConfig:
    """Configuration for a single tournament season."""
    competition_id: int
    competition_unique: str
    season: str
    year: int
    round_count: int
    expected_teams: int
    pool_id: int
    pool_name: str
    data_dir: str


def load_season_config(path: str) -> SeasonConfig:
    """Load a season configuration from a TOML file.

    Args:
        path: Path to the TOML configuration file.

    Returns:
        SeasonConfig with validated settings.

    Raises:
        FileNotFoundError: If the config file doesn't exist.
        KeyError: If required fields are missing.
    """
    config_path = Path(path)
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found: {path}")

    with open(config_path, "rb") as f:
        data = tomllib.load(f)

    comp = data["competition"]
    pool = data["pool"]
    paths = data["paths"]

    return SeasonConfig(
        competition_id=comp["id"],
        competition_unique=comp["unique"],
        season=comp["season"],
        year=comp["year"],
        round_count=comp["round_count"],
        expected_teams=comp["expected_teams"],
        pool_id=pool["id"],
        pool_name=pool["name"],
        data_dir=paths["data_dir"],
    )


def find_season_config(year: int) -> str:
    """Find the config file for a given year.

    Searches data/seasons/{year}.toml relative to the data directory.

    Args:
        year: The season year to look for.

    Returns:
        Path to the config file.

    Raises:
        FileNotFoundError: If no config exists for that year.
    """
    # Look relative to this file's parent (data/pipeline/ -> data/)
    data_dir = Path(__file__).parent.parent
    config_path = data_dir / "seasons" / f"{year}.toml"
    if not config_path.exists():
        raise FileNotFoundError(
            f"No season config found at {config_path}. "
            f"Create one by copying an existing config: cp data/seasons/2025.toml data/seasons/{year}.toml"
        )
    return str(config_path)
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd data && python -m pytest pipeline/tests/test_config.py -v
```
Expected: PASS

- [ ] **Step 5: Create the 2025 reference config**

```bash
mkdir -p data/seasons
```

```toml
# data/seasons/2025.toml
# Season configuration for March Radness 2025
# Copy this file and update values for a new season.

[competition]
id = 6
unique = "ncaambb-d1-championship"
season = "2024-25"
year = 2025
round_count = 7
expected_teams = 68

[pool]
id = 19
name = "March Radness 2025"

[paths]
data_dir = "data/2025"
```

- [ ] **Step 6: Create the 2026 template config**

```toml
# data/seasons/2026.toml
# Season configuration for March Radness 2026
# UPDATE these values after Selection Sunday

[competition]
id = 0          # Set after creating competition in Supabase
unique = "ncaambb-d1-championship"
season = "2025-26"
year = 2026
round_count = 7
expected_teams = 68

[pool]
id = 0          # Set after creating pool in Supabase
name = "March Radness 2026"

[paths]
data_dir = "data/2026"
```

- [ ] **Step 7: Commit**

```bash
git add data/pipeline/config.py data/pipeline/tests/test_config.py data/seasons/
git commit -m "feat: add season configuration system with TOML files"
```

---

### Task 3: Create shared Supabase client

**Files:**
- Create: `data/pipeline/supabase_client.py`

- [ ] **Step 1: Read how notebooks currently initialize Supabase**

Check the existing notebooks for the Supabase initialization pattern.

- [ ] **Step 2: Create supabase_client.py**

```python
# data/pipeline/supabase_client.py
# ABOUTME: Shared Supabase client initialization for all pipeline modules
# ABOUTME: Reads credentials from environment variables or .env.local file
import os
from pathlib import Path
from supabase import create_client, Client


def get_client() -> Client:
    """Create and return a Supabase client.

    Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_SUPABASE_SERVICE_ROLE_KEY
    from environment variables. Falls back to reading .env.local from
    the project root.

    Returns:
        Authenticated Supabase client.

    Raises:
        ValueError: If required environment variables are not set.
    """
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("NEXT_SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        _load_env_file()
        url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
        key = os.environ.get("NEXT_SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        raise ValueError(
            "Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and "
            "NEXT_SUPABASE_SERVICE_ROLE_KEY environment variables, or ensure "
            ".env.local exists in the project root."
        )

    return create_client(url, key)


def _load_env_file() -> None:
    """Load environment variables from .env.local if it exists."""
    # Walk up from data/pipeline/ to find project root
    env_path = Path(__file__).parent.parent.parent / ".env.local"
    if not env_path.exists():
        return

    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                os.environ.setdefault(key.strip(), value.strip())
```

- [ ] **Step 3: Commit**

```bash
git add data/pipeline/supabase_client.py
git commit -m "feat: add shared Supabase client for pipeline modules"
```

---

## Chunk 2: Data Loading Module

### Task 4: Extract data loading functions

**Files:**
- Create: `data/pipeline/data_loading.py`
- Create: `data/pipeline/tests/test_data_loading.py`

- [ ] **Step 1: Read load-data.ipynb completely**

Read every cell in `data/load-data.ipynb` to understand all functions.

- [ ] **Step 2: Write tests for key data loading functions**

```python
# data/pipeline/tests/test_data_loading.py
# ABOUTME: Tests for data loading pipeline functions
# ABOUTME: Tests CSV parsing and data transformation, NOT database operations
import pytest
from pipeline.data_loading import generate_rounds, generate_teams, generate_players


def test_generate_rounds_from_csv(tmp_path):
    """Generates round data from a well-formed CSV."""
    csv = tmp_path / "rounds.csv"
    csv.write_text(
        "round_num,round_name,round_start,round_end\n"
        "1,First Four,2025-03-18T18:30:00,2025-03-19T23:59:59\n"
        "2,Round of 64,2025-03-20T12:00:00,2025-03-21T23:59:59\n"
    )
    rounds = generate_rounds(str(csv), competition_id=6)
    assert len(rounds) == 2
    assert rounds[0]["round_num"] == "1"
    assert rounds[0]["competition_id"] == 6


def test_generate_rounds_empty_csv(tmp_path):
    """Raises an error for an empty CSV (headers only)."""
    csv = tmp_path / "rounds.csv"
    csv.write_text("round_num,round_name,round_start,round_end\n")
    rounds = generate_rounds(str(csv), competition_id=6)
    assert len(rounds) == 0
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd data && python -m pytest pipeline/tests/test_data_loading.py -v
```
Expected: FAIL

- [ ] **Step 4: Extract data loading functions from load-data.ipynb**

Create `data/pipeline/data_loading.py` by extracting and parameterizing functions from the notebook. Key functions:

- `generate_rounds(csv_path, competition_id)` → list of round dicts
- `add_rounds_to_db(csv_path, competition_id, supabase)` → upserts rounds
- `generate_conferences(csv_path, league_unique)` → list of conference dicts
- `add_conferences_to_db(csv_path, league_unique, supabase)` → inserts conferences
- `generate_teams(team_stats_csv, team_seeds_csv, league_unique, competition_id, expected_num_teams)` → (team_inserts, team_competition_inserts)
- `add_teams_to_db(...)` → upserts teams and team_competition
- `generate_players(player_stats_csv, competition_id, league_unique)` → (player_inserts, player_competition_inserts)
- `add_players_to_db(...)` → upserts players and player_competition
- `load_all(config, supabase)` → runs the full data load sequence

Each function should:
- Accept explicit parameters (no global state)
- Validate that CSV files exist before processing
- Validate expected columns exist in CSVs
- Return meaningful results (counts, data) instead of just printing

```python
# data/pipeline/data_loading.py
# ABOUTME: Functions for loading tournament data (teams, players, rounds) into Supabase
# ABOUTME: Extracted from load-data.ipynb with parameterized inputs and validation
import csv
from pathlib import Path
from typing import Any

from pipeline.config import SeasonConfig


def _validate_csv(path: str, required_columns: list[str]) -> None:
    """Validate that a CSV file exists and has required columns."""
    csv_path = Path(path)
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {path}")
    with open(csv_path) as f:
        reader = csv.DictReader(f)
        if reader.fieldnames is None:
            raise ValueError(f"CSV file is empty: {path}")
        missing = set(required_columns) - set(reader.fieldnames)
        if missing:
            raise ValueError(f"CSV {path} missing columns: {missing}")


def generate_rounds(csv_path: str, competition_id: int) -> list[dict[str, Any]]:
    """Parse rounds CSV and return list of round dicts for Supabase.

    Args:
        csv_path: Path to rounds CSV with columns: round_num, round_name, round_start, round_end
        competition_id: Competition ID to associate rounds with

    Returns:
        List of dicts ready for Supabase upsert.
    """
    _validate_csv(csv_path, ["round_num", "round_name", "round_start", "round_end"])
    rounds = []
    with open(csv_path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            if not row["round_num"].strip():
                continue
            row["competition_id"] = competition_id
            rounds.append(row)
    return rounds


def add_rounds_to_db(csv_path: str, competition_id: int, supabase) -> int:
    """Load rounds from CSV into Supabase.

    Returns:
        Number of rounds upserted.
    """
    rounds = generate_rounds(csv_path, competition_id)
    if not rounds:
        return 0
    result = supabase.table("competitionround").upsert(
        rounds, on_conflict="round_num, competition_id"
    ).execute()
    return len(result.data)


# Continue extracting generate_teams, generate_players, etc.
# following the same pattern from load-data.ipynb
# Each function: validate CSV, parse rows, return structured data

def load_all(config: SeasonConfig, supabase) -> dict[str, int]:
    """Run the full data loading sequence for a season.

    Args:
        config: Season configuration
        supabase: Supabase client

    Returns:
        Dict with counts of loaded entities: {"rounds": N, "teams": N, "players": N}
    """
    data_dir = Path(config.data_dir)
    counts = {}

    # Rounds
    rounds_csv = str(data_dir / f"rounds-{config.year}-ncaa-tournament.csv")
    counts["rounds"] = add_rounds_to_db(rounds_csv, config.competition_id, supabase)

    # Teams
    team_stats_csv = str(data_dir / f"{config.year}_ncaa_tournament_team_stats.csv")
    team_seeds_csv = str(data_dir / f"{config.year}_ncaa_tournament_team_seeds.csv")
    # counts["teams"] = add_teams_to_db(...)

    # Players
    player_stats_csv = str(data_dir / f"{config.year}_ncaa_tournament_player_stats.csv")
    # counts["players"] = add_players_to_db(...)

    return counts
```

Note: The actual implementation should extract the FULL logic from `load-data.ipynb` cells. The above shows the pattern — each function from the notebook becomes a parameterized function here. Reference the notebook exploration output for exact field names and transformation logic.

- [ ] **Step 5: Run tests**

```bash
cd data && python -m pytest pipeline/tests/test_data_loading.py -v
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add data/pipeline/data_loading.py data/pipeline/tests/test_data_loading.py
git commit -m "feat: extract data loading functions into pipeline module"
```

---

## Chunk 3: Game Recording Module

### Task 5: Extract game recording functions

**Files:**
- Create: `data/pipeline/game_recording.py`
- Create: `data/pipeline/tests/test_game_recording.py`

- [ ] **Step 1: Read record-games.ipynb completely**

Read every cell to understand all functions.

- [ ] **Step 2: Write tests for game recording functions**

```python
# data/pipeline/tests/test_game_recording.py
# ABOUTME: Tests for game recording pipeline functions
# ABOUTME: Tests CSV parsing and data transformation for game scores
import pytest
from pipeline.game_recording import parse_game_scoring_csv


def test_parse_scoring_csv_extracts_player_scores(tmp_path):
    """Parses a scoring CSV and extracts player game records."""
    csv = tmp_path / "scoring.csv"
    csv.write_text(
        "game_time,team_unique,lost,player_unique,points,inactive,game_id\n"
        "19:00:00,team-a,,player-1,22,,100\n"
        "19:00:00,team-a,,player-2,15,,100\n"
        "19:00:00,team-b,L,player-3,10,,100\n"
    )
    result = parse_game_scoring_csv(str(csv))
    assert len(result.player_games) == 3
    assert result.player_games[0]["points"] == 22
    assert "team-b" in result.losing_teams
    assert len(result.inactive_players) == 0


def test_parse_scoring_csv_detects_inactive_players(tmp_path):
    """Marks players with 'I' or 'i' in inactive column."""
    csv = tmp_path / "scoring.csv"
    csv.write_text(
        "game_time,team_unique,lost,player_unique,points,inactive,game_id\n"
        "19:00:00,team-a,,player-1,0,I,100\n"
    )
    result = parse_game_scoring_csv(str(csv))
    assert "player-1" in result.inactive_players


def test_parse_scoring_csv_missing_file():
    """Raises FileNotFoundError for missing CSV."""
    with pytest.raises(FileNotFoundError):
        parse_game_scoring_csv("nonexistent.csv")
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd data && python -m pytest pipeline/tests/test_game_recording.py -v
```

- [ ] **Step 4: Extract game recording functions**

```python
# data/pipeline/game_recording.py
# ABOUTME: Functions for recording game results from CSV files into Supabase
# ABOUTME: Handles schedule import, scoring sheet generation, and score/elimination recording
import csv
import datetime
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from pipeline.config import SeasonConfig


@dataclass
class ScoringResult:
    """Parsed results from a game scoring CSV."""
    player_games: list[dict[str, Any]] = field(default_factory=list)
    losing_teams: list[str] = field(default_factory=list)
    inactive_players: list[str] = field(default_factory=list)


def parse_game_scoring_csv(csv_path: str) -> ScoringResult:
    """Parse a game scoring CSV into structured results.

    Args:
        csv_path: Path to scoring CSV with columns:
            game_time, team_unique, lost, player_unique, points, inactive, game_id

    Returns:
        ScoringResult with player_games, losing_teams, and inactive_players.
    """
    path = Path(csv_path)
    if not path.exists():
        raise FileNotFoundError(f"Scoring CSV not found: {csv_path}")

    result = ScoringResult()

    with open(path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            lost = row.get("lost", "").strip().upper()
            inactive = row.get("inactive", "").strip().upper()
            points_str = row.get("points", "").strip()
            player_unique = row["player_unique"].strip()
            team_unique = row["team_unique"].strip()
            game_id = row["game_id"].strip()

            if lost == "L" and team_unique not in result.losing_teams:
                result.losing_teams.append(team_unique)

            if inactive == "I" and player_unique not in result.inactive_players:
                result.inactive_players.append(player_unique)

            if points_str:
                result.player_games.append({
                    "game_id": int(game_id),
                    "player_unique": player_unique,
                    "points": int(points_str),
                })

    return result


def update_scores_from_csv(
    csv_path: str,
    current_round: int,
    competition_id: int,
    supabase,
) -> dict[str, int]:
    """Record game results from a scoring CSV into Supabase.

    Processes player scores, team eliminations, and player injuries.

    Args:
        csv_path: Path to the filled-in scoring CSV
        current_round: Current tournament round number
        competition_id: Competition ID
        supabase: Supabase client

    Returns:
        Dict with counts: {"scores": N, "eliminations": N, "injuries": N}
    """
    result = parse_game_scoring_csv(csv_path)
    counts = {"scores": 0, "eliminations": 0, "injuries": 0}

    # Upsert player game scores
    if result.player_games:
        supabase.table("player_game").upsert(
            result.player_games, on_conflict="game_id, player_unique"
        ).execute()
        counts["scores"] = len(result.player_games)

    # Record competition update timestamp
    supabase.table("competition_updated").insert({
        "competition_id": competition_id,
        "round_num": current_round,
    }).execute()

    # Mark losing teams as eliminated
    for team in result.losing_teams:
        supabase.table("team_competition").update({
            "round_eliminated": current_round,
        }).eq("team_unique", team).eq(
            "competition_id", competition_id
        ).execute()
    counts["eliminations"] = len(result.losing_teams)

    # Mark inactive players
    for player in result.inactive_players:
        supabase.table("player_competition").update({
            "inactive": True,
        }).eq("player_unique", player).eq(
            "competition_id", competition_id
        ).execute()
    counts["injuries"] = len(result.inactive_players)

    return counts


def update_game_schedule(csv_path: str, supabase) -> int:
    """Import game schedule from CSV into Supabase.

    Args:
        csv_path: Path to schedule CSV with columns:
            game_date, team_1_id, team_2_id, game_time, round_num, competition_id

    Returns:
        Number of games upserted.
    """
    path = Path(csv_path)
    if not path.exists():
        raise FileNotFoundError(f"Schedule CSV not found: {csv_path}")

    games = []
    with open(path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            if not row.get("game_date", "").strip():
                continue
            games.append(row)

    if not games:
        return 0

    result = supabase.table("game").upsert(
        games, on_conflict="game_date, team_1_id, team_2_id"
    ).execute()
    return len(result.data)


def generate_game_scoring_sheet(
    date: str,
    competition_id: int,
    year: int,
    data_dir: str,
    supabase,
) -> str:
    """Generate a blank scoring sheet CSV for a game day.

    Queries the database for all players in games on the given date
    and creates a CSV template for manual score entry.

    Args:
        date: Game date (YYYY-MM-DD format)
        competition_id: Competition ID
        year: Season year (for file naming)
        data_dir: Directory to write the CSV
        supabase: Supabase client

    Returns:
        Path to the generated CSV file.
    """
    result = supabase.table("players_in_games_view").select("*").eq(
        "competition_id", competition_id
    ).eq("game_date", date).execute()

    output_path = Path(data_dir) / "scores" / f"{date}-game-scoring-{year}-ncaa-tournament.csv"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "game_time", "team_unique", "lost", "player_unique",
            "points", "inactive", "game_id",
        ])
        writer.writeheader()
        for row in result.data:
            writer.writerow({
                "game_time": row.get("game_time", ""),
                "team_unique": row.get("team_unique", ""),
                "lost": "",
                "player_unique": row.get("player_unique", ""),
                "points": "",
                "inactive": "",
                "game_id": row.get("game_id", ""),
            })

    return str(output_path)
```

- [ ] **Step 5: Run tests**

```bash
cd data && python -m pytest pipeline/tests/test_game_recording.py -v
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add data/pipeline/game_recording.py data/pipeline/tests/test_game_recording.py
git commit -m "feat: extract game recording functions into pipeline module"
```

---

## Chunk 4: Draft Module

### Task 6: Extract draft functions

**Files:**
- Create: `data/pipeline/draft.py`
- Create: `data/pipeline/tests/test_draft.py`

- [ ] **Step 1: Read draft.ipynb completely**

Read every cell to understand all draft functions.

- [ ] **Step 2: Write tests for key draft logic**

Focus on testable pure logic — ranking generation, draft order, pick selection:

```python
# data/pipeline/tests/test_draft.py
# ABOUTME: Tests for draft logic functions
# ABOUTME: Tests ranking generation and pick selection without database access
import pytest
from pipeline.draft import select_next_pick, apply_snake_order


def test_select_next_pick_returns_first_available():
    """Picks the highest-ranked available player."""
    rankings = ["player-a", "player-b", "player-c"]
    drafted = {"player-a"}
    active = {"player-b", "player-c"}
    pick = select_next_pick(rankings, drafted, active)
    assert pick == "player-b"


def test_select_next_pick_skips_eliminated():
    """Skips players not in the active set."""
    rankings = ["player-a", "player-b", "player-c"]
    drafted = set()
    active = {"player-c"}  # a and b eliminated
    pick = select_next_pick(rankings, drafted, active)
    assert pick == "player-c"


def test_select_next_pick_returns_none_when_empty():
    """Returns None when no available players remain."""
    rankings = ["player-a"]
    drafted = {"player-a"}
    active = set()
    pick = select_next_pick(rankings, drafted, active)
    assert pick is None


def test_apply_snake_order():
    """Snake draft reverses order on even rounds."""
    rosters = [1, 2, 3]
    assert apply_snake_order(rosters, round_num=1) == [1, 2, 3]
    assert apply_snake_order(rosters, round_num=2) == [3, 2, 1]
    assert apply_snake_order(rosters, round_num=3) == [1, 2, 3]
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd data && python -m pytest pipeline/tests/test_draft.py -v
```

- [ ] **Step 4: Extract draft functions**

Create `data/pipeline/draft.py` extracting from `draft.ipynb`. Key functions:

- `select_next_pick(rankings, drafted, active)` — pure function, no DB
- `apply_snake_order(rosters, round_num)` — pure function
- `generate_autodraft_rankings(pool_id, draft_num, strategy, supabase)` — queries DB
- `generate_rankings_dict(pool_id, draft_num, max_players, num_participants, strategy, supabase)` — queries DB
- `run_draft(config, draft_num, starting_pick_num, strategy, supabase)` — main draft execution
- `generate_draft_order(pool_id, draft_num, supabase)` — generates/retrieves order
- `drop_inactive_players(draft_num, pool_id, supabase)` — cleanup
- `maintain_rosters(draft_num, pool_id, supabase)` — drop inactive + fill

Fix the known bug in `generate_rankings_dict` where appending autodraft rankings could create duplicates — deduplicate before returning.

Fix the `update_game_schedule` missing conflict handling — add `on_conflict` parameter.

- [ ] **Step 5: Run tests**

```bash
cd data && python -m pytest pipeline/tests/test_draft.py -v
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add data/pipeline/draft.py data/pipeline/tests/test_draft.py
git commit -m "feat: extract draft logic into pipeline module with bug fixes"
```

---

## Chunk 5: CLI & Notebooks

### Task 7: Build the CLI

**Files:**
- Create: `data/pipeline/cli.py`

- [ ] **Step 1: Create CLI with all commands**

```python
# data/pipeline/cli.py
# ABOUTME: Command-line interface for the fantasy bracket data pipeline
# ABOUTME: Usage: python -m pipeline <command> [options]. Run with --help for details.
import argparse
import sys

from pipeline.config import load_season_config, find_season_config
from pipeline.supabase_client import get_client


def main():
    parser = argparse.ArgumentParser(
        prog="pipeline",
        description="Fantasy bracket data pipeline for NCAA tournament management.",
        epilog="Example: python -m pipeline load-data --season 2026",
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # load-data
    load_parser = subparsers.add_parser(
        "load-data",
        help="Load teams, players, and rounds from CSV files into Supabase",
        description="Runs the full data loading sequence: rounds, conferences, teams, players.",
    )
    load_parser.add_argument("--season", type=int, required=True, help="Season year (e.g. 2026)")

    # generate-scoring-sheet
    score_sheet_parser = subparsers.add_parser(
        "generate-scoring-sheet",
        help="Generate a blank scoring CSV for a game day",
        description="Creates a CSV template with all players in games on the given date. Fill in points, losses, and injuries, then use record-scores.",
    )
    score_sheet_parser.add_argument("--date", required=True, help="Game date (YYYY-MM-DD)")
    score_sheet_parser.add_argument("--season", type=int, required=True, help="Season year")

    # record-scores
    record_parser = subparsers.add_parser(
        "record-scores",
        help="Record game scores from a filled-in scoring CSV",
        description="Processes a scoring CSV to record player points, team eliminations, and player injuries.",
    )
    record_parser.add_argument("--date", required=True, help="Game date (YYYY-MM-DD)")
    record_parser.add_argument("--round", type=int, required=True, help="Current tournament round number")
    record_parser.add_argument("--season", type=int, required=True, help="Season year")

    # update-schedule
    sched_parser = subparsers.add_parser(
        "update-schedule",
        help="Import a round's game schedule from CSV",
        description="Loads game matchups and times for a tournament round.",
    )
    sched_parser.add_argument("--round", type=int, required=True, help="Round number")
    sched_parser.add_argument("--season", type=int, required=True, help="Season year")

    # run-draft
    draft_parser = subparsers.add_parser(
        "run-draft",
        help="Execute the draft for a pool",
        description="Runs the snake draft algorithm using submitted rankings and autodraft for remaining picks.",
    )
    draft_parser.add_argument("--pool", type=int, required=True, help="Pool ID")
    draft_parser.add_argument("--draft-num", type=int, required=True, help="Draft number")
    draft_parser.add_argument("--strategy", default="TOURNAMENT_POINTS",
                              choices=["RANDOM", "TOURNAMENT_POINTS", "RANDOM_WITH_POINTS"],
                              help="Autodraft strategy for unranked players (default: TOURNAMENT_POINTS)")

    # maintain-rosters
    maintain_parser = subparsers.add_parser(
        "maintain-rosters",
        help="Drop inactive players and fill rosters to target size",
        description="Removes players who were injured/inactive before the draft round, then fills empty roster slots using the draft order and autodraft strategy.",
    )
    maintain_parser.add_argument("--pool", type=int, required=True, help="Pool ID")
    maintain_parser.add_argument("--draft-num", type=int, required=True, help="Draft number")
    maintain_parser.add_argument("--strategy", default="TOURNAMENT_POINTS",
                              choices=["RANDOM", "TOURNAMENT_POINTS", "RANDOM_WITH_POINTS"],
                              help="Autodraft strategy (default: TOURNAMENT_POINTS)")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    # Dispatch to command handlers
    if args.command == "load-data":
        _cmd_load_data(args)
    elif args.command == "generate-scoring-sheet":
        _cmd_generate_scoring_sheet(args)
    elif args.command == "record-scores":
        _cmd_record_scores(args)
    elif args.command == "update-schedule":
        _cmd_update_schedule(args)
    elif args.command == "run-draft":
        _cmd_run_draft(args)
    elif args.command == "maintain-rosters":
        _cmd_maintain_rosters(args)


def _cmd_load_data(args):
    from pipeline.data_loading import load_all
    config = load_season_config(find_season_config(args.season))
    supabase = get_client()
    counts = load_all(config, supabase)
    print(f"Loaded: {counts}")


def _cmd_generate_scoring_sheet(args):
    from pipeline.game_recording import generate_game_scoring_sheet
    config = load_season_config(find_season_config(args.season))
    supabase = get_client()
    path = generate_game_scoring_sheet(
        date=args.date,
        competition_id=config.competition_id,
        year=config.year,
        data_dir=config.data_dir,
        supabase=supabase,
    )
    print(f"Generated scoring sheet: {path}")


def _cmd_record_scores(args):
    from pipeline.game_recording import update_scores_from_csv
    config = load_season_config(find_season_config(args.season))
    supabase = get_client()
    csv_path = f"{config.data_dir}/scores/{args.date}-game-scoring-{config.year}-ncaa-tournament.csv"
    counts = update_scores_from_csv(
        csv_path=csv_path,
        current_round=args.round,
        competition_id=config.competition_id,
        supabase=supabase,
    )
    print(f"Recorded: {counts}")


def _cmd_update_schedule(args):
    from pipeline.game_recording import update_game_schedule
    config = load_season_config(find_season_config(args.season))
    supabase = get_client()
    csv_path = f"{config.data_dir}/schedules/game-schedule-round-{args.round}-{config.year}-ncaa-tournament.csv"
    count = update_game_schedule(csv_path, supabase)
    print(f"Upserted {count} games for round {args.round}")


def _cmd_run_draft(args):
    from pipeline.draft import run_draft
    supabase = get_client()
    result = run_draft(
        pool_id=args.pool,
        draft_num=args.draft_num,
        strategy=args.strategy,
        supabase=supabase,
    )
    print(f"Draft complete: {result}")


def _cmd_maintain_rosters(args):
    from pipeline.draft import maintain_rosters
    supabase = get_client()
    result = maintain_rosters(
        pool_id=args.pool,
        draft_num=args.draft_num,
        strategy=args.strategy,
        supabase=supabase,
    )
    print(f"Roster maintenance: {result}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Test CLI --help output**

```bash
cd data && python -m pipeline --help
cd data && python -m pipeline load-data --help
cd data && python -m pipeline record-scores --help
```

Each command should print clear help text with argument descriptions.

- [ ] **Step 3: Commit**

```bash
git add data/pipeline/cli.py data/pipeline/__main__.py
git commit -m "feat: add CLI interface for all pipeline commands"
```

---

### Task 8: Create agent-readable documentation

**Files:**
- Create: `data/pipeline/README.md`

- [ ] **Step 1: Write README**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add data/pipeline/README.md
git commit -m "docs: add pipeline README for agent and human reference"
```

---

### Task 9: Convert notebooks to thin wrappers

**Files:**
- Modify: `data/draft.ipynb`
- Modify: `data/record-games.ipynb`
- Modify: `data/load-data.ipynb`

- [ ] **Step 1: Update load-data.ipynb**

Replace notebook cells with imports from the pipeline package. Keep the notebook structure (cells for each step) but replace inline code with function calls:

Cell 1 (Setup):
```python
from pipeline.config import load_season_config, find_season_config
from pipeline.supabase_client import get_client
from pipeline.data_loading import load_all, add_rounds_to_db, add_teams_to_db, add_players_to_db

config = load_season_config(find_season_config(2026))
supabase = get_client()
```

Cell 2 (Load all):
```python
counts = load_all(config, supabase)
print(counts)
```

Or individual steps in separate cells for debugging.

- [ ] **Step 2: Update record-games.ipynb similarly**

- [ ] **Step 3: Update draft.ipynb similarly**

- [ ] **Step 4: Verify notebooks still work**

Open each notebook, run all cells, verify no errors.

- [ ] **Step 5: Commit**

```bash
git add data/*.ipynb
git commit -m "refactor: convert notebooks to thin wrappers over pipeline modules"
```

---

### Task 10: Final verification

- [ ] **Step 1: Run all tests**

```bash
cd data && python -m pytest pipeline/tests/ -v
```
Expected: All pass

- [ ] **Step 2: Test CLI end-to-end with 2025 data**

```bash
cd data && python -m pipeline load-data --season 2025
```
This should work against the existing 2025 data and Supabase instance (idempotent upserts).

- [ ] **Step 3: Verify --help is comprehensive**

```bash
cd data && python -m pipeline --help
cd data && python -m pipeline load-data --help
cd data && python -m pipeline generate-scoring-sheet --help
cd data && python -m pipeline record-scores --help
cd data && python -m pipeline update-schedule --help
cd data && python -m pipeline run-draft --help
cd data && python -m pipeline maintain-rosters --help
```

- [ ] **Step 4: Final commit and PR**

```bash
git add -A  # After reviewing git status
git commit -m "chore: WS3 pipeline extraction complete"
git push -u origin staff/ws3-pipeline
gh pr create --title "WS3: Python data pipeline extraction" --body "$(cat <<'EOF'
## Summary
- Extracted Jupyter notebook code into importable Python modules (`data/pipeline/`)
- Added CLI: `python -m pipeline <command> --help`
- Season configuration via TOML files (`data/seasons/`)
- Fixed bugs: duplicate rankings in generate_rankings_dict, missing conflict handling in schedule import
- CSV validation with clear error messages
- Notebooks converted to thin wrappers
- Agent-readable README documenting all commands and workflows

## Test plan
- [ ] `python -m pytest pipeline/tests/ -v` — all tests pass
- [ ] `python -m pipeline --help` — comprehensive help text
- [ ] `python -m pipeline load-data --season 2025` — idempotent load succeeds
- [ ] Notebooks still execute correctly
- [ ] CLI commands produce clear error messages for missing files/config

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
