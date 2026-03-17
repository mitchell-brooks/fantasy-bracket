# Sportsipy Separation & Pipeline Reorganization

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vendor sportsipy's ncaab parsing code into fantasy-bracket, separate HTTP transport from parsing, add data extraction with observability, and reorganize data files into a consistent year-based structure.

**Architecture:** Three layers: a vendored scraper (parsing only, accepts injectable session), an HTTP module (IP rotation + retry), and pipeline commands (extraction + loading + manifest). Integrates with the existing WS3 pipeline skeleton at `data/pipeline/`.

**Tech Stack:** Python 3.9+, requests, requests-ip-rotator, pyquery, pandas, supabase-py, TOML configs (matching existing WS3 pattern)

**Spec:** `docs/superpowers/specs/2026-03-17-sportsipy-separation-design.md`

**Existing code:** `data/pipeline/` already has a WS3 skeleton with `config.py` (TOML-based SeasonConfig), `cli.py` (argparse with subcommands), `supabase_client.py`, and `data_loading.py`. This plan extends that structure rather than replacing it.

---

## File Map

### Files to Create
- `data/pipeline/scraper/__init__.py` — Public API: Teams, Team, Roster, Player
- `data/pipeline/scraper/utils.py` — Parsing helpers from sportsipy/utils.py (no HTTP transport)
- `data/pipeline/scraper/constants.py` — WIN, LOSS, HOME, AWAY constants
- `data/pipeline/scraper/decorators.py` — Property decorators
- `data/pipeline/scraper/ncaab/__init__.py` — Package init
- `data/pipeline/scraper/ncaab/constants.py` — URLs, parsing schemes
- `data/pipeline/scraper/ncaab/ncaab_utils.py` — _retrieve_all_teams
- `data/pipeline/scraper/ncaab/teams.py` — Teams, Team classes
- `data/pipeline/scraper/ncaab/roster.py` — Roster class
- `data/pipeline/scraper/ncaab/player.py` — AbstractPlayer, Player
- `data/pipeline/scraper/ncaab/schedule.py` — Schedule, Game
- `data/pipeline/scraper/ncaab/boxscore.py` — Boxscore, BoxscorePlayer
- `data/pipeline/scraper/ncaab/conferences.py` — Conferences
- `data/pipeline/scraper/ncaab/rankings.py` — Rankings
- `data/pipeline/http.py` — Session factory with IP rotation and retry
- `data/pipeline/extraction.py` — Tournament data pull orchestration
- `data/pipeline/manifest.py` — Run manifest and structured logging
- `data/pipeline/tests/test_http.py` — HTTP layer tests
- `data/pipeline/tests/test_manifest.py` — Manifest tests
- `data/pipeline/tests/test_extraction.py` — Extraction tests
- `data/seasons/2025.toml` — Season config for 2025
- `data/seasons/2026.toml` — Season config for 2026

### Files to Modify
- `data/pipeline/cli.py` — Add `pull` subcommand
- `data/pipeline/config.py` — Add HTTP config fields to SeasonConfig
- `data/pyproject.toml` — Add pyquery dependency

### Files to Move (Data Migration)
- `data/2023/*` → `data/output/2023/`
- `data/2024/*` → `data/output/2024/`
- `data/2025/*` → `data/output/2025/`
- `data/2026/*` → `data/output/2026/`

### Files to Remove (after migration)
- `data/load_2026.py` — Replaced by `pipeline load-data`

---

## Chunk 1: Vendor the Scraper

### Task 1: Create scraper package structure and copy core files

**Files:**
- Create: `data/pipeline/scraper/__init__.py`
- Create: `data/pipeline/scraper/constants.py`
- Create: `data/pipeline/scraper/decorators.py`

- [ ] **Step 1: Create a working branch**

```bash
git checkout -b staff/sportsipy-separation
```

- [ ] **Step 2: Create scraper directory structure**

```bash
mkdir -p data/pipeline/scraper/ncaab
```

- [ ] **Step 3: Copy core sportsipy files**

Copy the 3 root-level files from `~/code/sportsipy/sportsipy/`:

```bash
cp ~/code/sportsipy/sportsipy/constants.py data/pipeline/scraper/constants.py
cp ~/code/sportsipy/sportsipy/decorators.py data/pipeline/scraper/decorators.py
```

These files have no internal sportsipy imports, so they need no modifications.

- [ ] **Step 4: Create `scraper/__init__.py`**

```python
# ABOUTME: Public API for the basketball-reference scraper
# ABOUTME: Vendored from sportsipy ncaab module — parsing only, no HTTP transport
from pipeline.scraper.ncaab.teams import Teams, Team
from pipeline.scraper.ncaab.roster import Roster
from pipeline.scraper.ncaab.player import Player

__all__ = ["Teams", "Team", "Roster", "Player"]
```

- [ ] **Step 5: Commit**

```bash
git add data/pipeline/scraper/
git commit -m "chore: create scraper package structure with core constants and decorators"
```

---

### Task 2: Create scraper/utils.py — parsing helpers only

**Files:**
- Create: `data/pipeline/scraper/utils.py`
- Source: `~/code/sportsipy/sportsipy/utils.py`

This is the key separation point. We copy the parsing helpers from sportsipy's utils.py but replace the HTTP transport with a configurable session.

- [ ] **Step 1: Create `scraper/utils.py`**

Copy `~/code/sportsipy/sportsipy/utils.py` to `data/pipeline/scraper/utils.py`.

Then make the following changes:

1. **Remove** all IP rotation code: `establish_api_gateway`, `request_through_api_gateway`, `get_host_from_url`, the `requests_ip_rotator` import, and the `ratelimit` imports/decorators.

2. **Replace** the HTTP transport with a configurable session:

```python
import requests

_session = requests.Session()

def configure_session(session: requests.Session) -> None:
    """Inject an HTTP session for all page fetches.

    Call this before using any scraper APIs to configure
    how HTTP requests are made (e.g., with IP rotation).
    If not called, uses a plain requests.Session.
    """
    global _session
    _session = session
```

3. **Update `_pull_page()`** to use `_session` instead of `request_through_api_gateway`:

```python
def _pull_page(url=None, local_file=None):
    if local_file:
        with open(local_file, 'r', encoding='utf8') as filehandle:
            return pq(filehandle.read())
    if url:
        response = _session.get(url)
        return pq(response.text)
    raise ValueError('Expected either a URL or a local data file!')
```

4. **Keep** all parsing helpers unchanged: `_parse_field`, `_parse_abbreviation`, `_remove_html_comment_tags`, `_get_stats_table`, `_find_year_for_season`, `_url_exists`, `_no_data_found`.

5. **Update `_url_exists()`** to use `_session`:

```python
def _url_exists(url):
    response = _session.head(url)
    return response.status_code < 400
```

- [ ] **Step 2: Verify the file has no references to `request_through_api_gateway`, `ApiGateway`, `ratelimit`, or `requests_ip_rotator`**

```bash
grep -n "api_gateway\|ApiGateway\|ratelimit\|ip_rotator" data/pipeline/scraper/utils.py
```

Expected: no output

- [ ] **Step 3: Commit**

```bash
git add data/pipeline/scraper/utils.py
git commit -m "feat: create scraper/utils.py with injectable session, no HTTP transport"
```

---

### Task 3: Copy ncaab module and update imports

**Files:**
- Create: `data/pipeline/scraper/ncaab/__init__.py`
- Create: `data/pipeline/scraper/ncaab/constants.py`
- Create: `data/pipeline/scraper/ncaab/ncaab_utils.py`
- Create: `data/pipeline/scraper/ncaab/teams.py`
- Create: `data/pipeline/scraper/ncaab/roster.py`
- Create: `data/pipeline/scraper/ncaab/player.py`
- Create: `data/pipeline/scraper/ncaab/schedule.py`
- Create: `data/pipeline/scraper/ncaab/boxscore.py`
- Create: `data/pipeline/scraper/ncaab/conferences.py`
- Create: `data/pipeline/scraper/ncaab/rankings.py`

- [ ] **Step 1: Copy all ncaab files**

```bash
cp ~/code/sportsipy/sportsipy/ncaab/__init__.py data/pipeline/scraper/ncaab/__init__.py
cp ~/code/sportsipy/sportsipy/ncaab/constants.py data/pipeline/scraper/ncaab/constants.py
cp ~/code/sportsipy/sportsipy/ncaab/ncaab_utils.py data/pipeline/scraper/ncaab/ncaab_utils.py
cp ~/code/sportsipy/sportsipy/ncaab/teams.py data/pipeline/scraper/ncaab/teams.py
cp ~/code/sportsipy/sportsipy/ncaab/roster.py data/pipeline/scraper/ncaab/roster.py
cp ~/code/sportsipy/sportsipy/ncaab/player.py data/pipeline/scraper/ncaab/player.py
cp ~/code/sportsipy/sportsipy/ncaab/schedule.py data/pipeline/scraper/ncaab/schedule.py
cp ~/code/sportsipy/sportsipy/ncaab/boxscore.py data/pipeline/scraper/ncaab/boxscore.py
cp ~/code/sportsipy/sportsipy/ncaab/conferences.py data/pipeline/scraper/ncaab/conferences.py
cp ~/code/sportsipy/sportsipy/ncaab/rankings.py data/pipeline/scraper/ncaab/rankings.py
```

- [ ] **Step 2: Update all import paths**

In every file, replace `sportsipy` imports with `pipeline.scraper` imports:

```bash
# In all .py files under data/pipeline/scraper/ncaab/
find data/pipeline/scraper/ncaab -name "*.py" -exec sed -i '' \
  -e 's/from sportsipy\./from pipeline.scraper./g' \
  -e 's/import sportsipy\./import pipeline.scraper./g' \
  -e 's/from \.\.constants/from pipeline.scraper.constants/g' \
  -e 's/from \.\. import utils/from pipeline.scraper import utils/g' \
  -e 's/from \.\.decorators/from pipeline.scraper.decorators/g' \
  -e 's/sportsipy\.utils/pipeline.scraper.utils/g' \
  {} \;
```

After the automated replacement, manually verify each file's imports are correct. The key patterns:

| Original | Replacement |
|----------|-------------|
| `from sportsipy import utils` | `from pipeline.scraper import utils` |
| `from sportsipy.constants import ...` | `from pipeline.scraper.constants import ...` |
| `from sportsipy.decorators import ...` | `from pipeline.scraper.decorators import ...` |
| `from .constants import ...` | No change (relative imports within ncaab stay relative) |
| `from ..constants import ...` | `from pipeline.scraper.constants import ...` |
| `from .. import utils` | `from pipeline.scraper import utils` |

- [ ] **Step 3: Verify no remaining sportsipy references**

```bash
grep -rn "sportsipy" data/pipeline/scraper/
```

Expected: no output (or only in comments about provenance)

- [ ] **Step 4: Verify imports resolve**

```bash
cd data && python -c "from pipeline.scraper import Teams, Team, Roster, Player; print('Imports OK')"
```

Expected: `Imports OK` (this will attempt to create an API gateway unless we've fully separated transport — if it fails on import, the `utils.py` still has transport code)

- [ ] **Step 5: Add `pyquery` to dependencies if not already present**

Check `data/pyproject.toml` and add `pyquery` if missing:

```bash
grep pyquery data/pyproject.toml || echo 'pyquery not found — add it'
```

If missing, add via:
```bash
cd data && poetry add pyquery
```

- [ ] **Step 6: Commit**

```bash
git add data/pipeline/scraper/ncaab/ data/pyproject.toml data/poetry.lock
git commit -m "feat: vendor ncaab parsing module with updated import paths"
```

---

## Chunk 2: HTTP Layer and Manifest

### Task 4: Build the HTTP session factory

**Files:**
- Create: `data/pipeline/http.py`
- Create: `data/pipeline/tests/test_http.py`

- [ ] **Step 1: Write failing tests for `create_session` and `shutdown_session`**

```python
# data/pipeline/tests/test_http.py
# ABOUTME: Tests for the HTTP session factory
# ABOUTME: Verifies session creation with and without IP rotation, and retry behavior
import requests
import pytest
from pipeline.http import create_session, shutdown_session


def test_create_session_without_ip_rotation():
    """A session without IP rotation is a plain requests.Session."""
    config = {"http": {"ip_rotation": False}}
    session = create_session(config)
    assert isinstance(session, requests.Session)
    shutdown_session(session)


def test_create_session_default_config():
    """Missing http config returns a plain session."""
    config = {}
    session = create_session(config)
    assert isinstance(session, requests.Session)
    shutdown_session(session)


def test_retry_on_403(monkeypatch):
    """Session retries on 403 responses up to max_attempts."""
    config = {
        "http": {
            "ip_rotation": False,
            "retry": {"max_attempts": 3, "backoff_base_seconds": 0},
        }
    }
    session = create_session(config)
    call_count = 0
    original_get = session.get

    def mock_get(url, **kwargs):
        nonlocal call_count
        call_count += 1
        resp = requests.Response()
        resp.status_code = 403 if call_count < 3 else 200
        resp._content = b"<html></html>"
        return resp

    session.get = mock_get
    response = session.get("http://example.com")
    assert response.status_code == 200
    assert call_count == 3
    shutdown_session(session)
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd data && python -m pytest pipeline/tests/test_http.py -v
```

Expected: FAIL (module not found)

- [ ] **Step 3: Implement `http.py`**

```python
# data/pipeline/http.py
# ABOUTME: HTTP session factory with optional IP rotation and configurable retry
# ABOUTME: Creates requests.Session instances that can be injected into the scraper
import logging
import time
from typing import Any

import requests

logger = logging.getLogger(__name__)

_DEFAULT_REGIONS = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1', 'eu-central-1',
    'ca-central-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1',
    'ap-northeast-2', 'ap-south-1', 'sa-east-1',
]

_HOST = "https://www.sports-reference.com/"


class RetrySession(requests.Session):
    """A requests.Session that retries on 403 with configurable backoff."""

    def __init__(self, max_attempts: int = 5, backoff_base: float = 3.0):
        super().__init__()
        self._max_attempts = max_attempts
        self._backoff_base = backoff_base

    def get(self, url, **kwargs):
        for attempt in range(self._max_attempts):
            response = super().get(url, **kwargs)
            if response.status_code != 403:
                return response
            if attempt < self._max_attempts - 1:
                wait = self._backoff_base * (attempt + 1)
                logger.warning(
                    "403 on attempt %d for %s, retrying in %.0fs",
                    attempt + 1, url[:80], wait
                )
                time.sleep(wait)
        logger.error("All %d attempts returned 403 for %s", self._max_attempts, url[:80])
        return response


def create_session(config: dict[str, Any]) -> requests.Session:
    """Create an HTTP session based on config.

    If config["http"]["ip_rotation"] is true, mounts an AWS API Gateway
    adapter for IP rotation. Always wraps with retry logic.
    """
    http_config = config.get("http", {})
    retry_config = http_config.get("retry", {})
    max_attempts = retry_config.get("max_attempts", 5)
    backoff_base = retry_config.get("backoff_base_seconds", 3.0)

    session = RetrySession(
        max_attempts=max_attempts,
        backoff_base=backoff_base,
    )

    if http_config.get("ip_rotation", False):
        try:
            from requests_ip_rotator import ApiGateway
        except ImportError:
            raise ImportError(
                "IP rotation requires requests-ip-rotator: pip install requests-ip-rotator"
            )
        regions = http_config.get("regions", _DEFAULT_REGIONS)
        gateway = ApiGateway(_HOST, regions=regions)
        gateway.start()
        session.mount(_HOST, gateway)
        session._gateway = gateway  # store for shutdown
        logger.info("API Gateway established with %d regions", len(regions))

    return session


def shutdown_session(session: requests.Session) -> None:
    """Shut down any API Gateway resources on the session."""
    gateway = getattr(session, '_gateway', None)
    if gateway:
        try:
            gateway.shutdown()
            logger.info("API Gateway shut down")
        except Exception as e:
            logger.warning("Error shutting down gateway: %s", e)
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd data && python -m pytest pipeline/tests/test_http.py -v
```

Expected: 3 tests PASS

Note: the retry test uses monkeypatching, so it doesn't need actual HTTP. The IP rotation test is skipped unless `requests_ip_rotator` is installed and AWS creds are available.

- [ ] **Step 5: Commit**

```bash
git add data/pipeline/http.py data/pipeline/tests/test_http.py
git commit -m "feat: add HTTP session factory with retry and optional IP rotation"
```

---

### Task 5: Build the manifest and logging module

**Files:**
- Create: `data/pipeline/manifest.py`
- Create: `data/pipeline/tests/test_manifest.py`

- [ ] **Step 1: Write failing tests**

```python
# data/pipeline/tests/test_manifest.py
# ABOUTME: Tests for the run manifest and logging module
# ABOUTME: Verifies manifest creation, failure tracking, and retry command generation
import json
import os
from pathlib import Path
from pipeline.manifest import RunManifest


def test_manifest_tracks_team_success(tmp_path):
    manifest = RunManifest(
        config_path="seasons/2026.json",
        expected_teams=68,
        output_dir=str(tmp_path),
    )
    manifest.record_team_success("DUKE", 12)
    assert manifest.teams_succeeded == 1
    assert manifest.players_total == 12


def test_manifest_tracks_team_failure(tmp_path):
    manifest = RunManifest(
        config_path="seasons/2026.json",
        expected_teams=68,
        output_dir=str(tmp_path),
    )
    manifest.record_team_failure("VILLANOVA")
    assert manifest.teams_failed == ["VILLANOVA"]


def test_manifest_tracks_player_failure(tmp_path):
    manifest = RunManifest(
        config_path="seasons/2026.json",
        expected_teams=68,
        output_dir=str(tmp_path),
    )
    manifest.record_player_failure("milos-uzan-1")
    assert manifest.players_failed == ["milos-uzan-1"]


def test_manifest_generates_retry_commands(tmp_path):
    manifest = RunManifest(
        config_path="seasons/2026.json",
        expected_teams=68,
        output_dir=str(tmp_path),
    )
    manifest.record_team_failure("VILLANOVA")
    manifest.record_player_failure("milos-uzan-1")
    commands = manifest.retry_commands()
    assert any("--retry-teams VILLANOVA" in cmd for cmd in commands)
    assert any("--retry-players milos-uzan-1" in cmd for cmd in commands)


def test_manifest_saves_to_file(tmp_path):
    manifest = RunManifest(
        config_path="seasons/2026.json",
        expected_teams=68,
        output_dir=str(tmp_path),
    )
    manifest.record_team_success("DUKE", 12)
    manifest.save()
    manifest_path = tmp_path / "manifest.json"
    assert manifest_path.exists()
    data = json.loads(manifest_path.read_text())
    assert data["teams_succeeded"] == 1
    assert data["players_total"] == 12
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd data && python -m pytest pipeline/tests/test_manifest.py -v
```

Expected: FAIL (module not found)

- [ ] **Step 3: Implement `manifest.py`**

```python
# data/pipeline/manifest.py
# ABOUTME: Tracks results of a data pull run and produces a manifest file
# ABOUTME: Records successes, failures, and generates retry commands
import json
import logging
from datetime import datetime, timezone
from pathlib import Path

logger = logging.getLogger(__name__)


class RunManifest:
    """Tracks the results of a data pull run."""

    def __init__(self, config_path: str, expected_teams: int, output_dir: str):
        self.config_path = config_path
        self.expected_teams = expected_teams
        self.output_dir = output_dir
        self.run_timestamp = datetime.now(timezone.utc).isoformat()
        self._teams_succeeded: list[str] = []
        self._teams_failed: list[str] = []
        self._players_failed: list[str] = []
        self._players_total = 0
        self._output_files: dict[str, str] = {}

    @property
    def teams_succeeded(self) -> int:
        return len(self._teams_succeeded)

    @property
    def teams_failed(self) -> list[str]:
        return list(self._teams_failed)

    @property
    def players_failed(self) -> list[str]:
        return list(self._players_failed)

    @property
    def players_total(self) -> int:
        return self._players_total

    def record_team_success(self, team: str, player_count: int) -> None:
        self._teams_succeeded.append(team)
        self._players_total += player_count
        logger.info("team %s: %d players", team, player_count)

    def record_team_failure(self, team: str) -> None:
        self._teams_failed.append(team)
        logger.error("team %s: failed (0 players)", team)

    def record_player_failure(self, player_id: str) -> None:
        self._players_failed.append(player_id)
        logger.error("player %s: all attempts failed", player_id)

    def set_output_file(self, key: str, filename: str) -> None:
        self._output_files[key] = filename

    def retry_commands(self) -> list[str]:
        commands = []
        base = f"python -m pipeline pull --config {self.config_path}"
        if self._teams_failed:
            teams = " ".join(self._teams_failed)
            commands.append(f"{base} --retry-teams {teams}")
        if self._players_failed:
            players = " ".join(self._players_failed)
            commands.append(f"{base} --retry-players {players}")
        return commands

    def to_dict(self) -> dict:
        return {
            "run_timestamp": self.run_timestamp,
            "config": self.config_path,
            "teams_expected": self.expected_teams,
            "teams_succeeded": self.teams_succeeded,
            "teams_failed": self._teams_failed,
            "players_total": self._players_total,
            "players_failed": self._players_failed,
            "retry_commands": self.retry_commands(),
            "output_files": self._output_files,
        }

    def save(self) -> Path:
        output_path = Path(self.output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        manifest_path = output_path / "manifest.json"
        manifest_path.write_text(json.dumps(self.to_dict(), indent=2))
        logger.info("Manifest saved to %s", manifest_path)
        return manifest_path


def configure_logging(output_dir: str, level: int = logging.INFO) -> None:
    """Set up logging to both console and a run.log file."""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    log_format = "%(asctime)s %(levelname)-5s %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"

    # File handler
    file_handler = logging.FileHandler(output_path / "run.log")
    file_handler.setFormatter(logging.Formatter(log_format, date_format))

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(log_format, date_format))

    # Configure root logger for pipeline
    pipeline_logger = logging.getLogger("pipeline")
    pipeline_logger.setLevel(level)
    pipeline_logger.addHandler(file_handler)
    pipeline_logger.addHandler(console_handler)
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd data && python -m pytest pipeline/tests/test_manifest.py -v
```

Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add data/pipeline/manifest.py data/pipeline/tests/test_manifest.py
git commit -m "feat: add run manifest and structured logging"
```

---

## Chunk 3: Extraction Pipeline

### Task 6: Update SeasonConfig for HTTP settings

**Files:**
- Modify: `data/pipeline/config.py`

The existing SeasonConfig uses TOML and has competition/pool/path fields. We need to add HTTP config fields.

- [ ] **Step 1: Add HTTP config fields to SeasonConfig**

Add these fields to the `SeasonConfig` dataclass in `data/pipeline/config.py`:

```python
# Add to the dataclass
ip_rotation: bool = False
retry_max_attempts: int = 5
retry_backoff_base_seconds: float = 3.0
delay_between_teams: float = 3.0
delay_between_players: float = 0.5
teams: list[str] = None  # tournament team list
stats_thru: str = ""  # date string for stats snapshot
```

Update `load_season_config()` to read the new fields from the TOML `[http]` and `[extraction]` sections:

```python
http = data.get("http", {})
retry = http.get("retry", {})
delay = http.get("delay", {})
extraction = data.get("extraction", {})

return SeasonConfig(
    # ... existing fields ...
    ip_rotation=http.get("ip_rotation", False),
    retry_max_attempts=retry.get("max_attempts", 5),
    retry_backoff_base_seconds=retry.get("backoff_base_seconds", 3.0),
    delay_between_teams=delay.get("between_teams", 3.0),
    delay_between_players=delay.get("between_players", 0.5),
    teams=extraction.get("teams", []),
    stats_thru=extraction.get("stats_thru", ""),
)
```

- [ ] **Step 2: Commit**

```bash
git add data/pipeline/config.py
git commit -m "feat: add HTTP and extraction config fields to SeasonConfig"
```

---

### Task 7: Create the season config for 2026

**Files:**
- Create: `data/seasons/2026.toml`

- [ ] **Step 1: Create `data/seasons/2026.toml`**

```toml
[competition]
id = 8
unique = "ncaambb-d1-championship"
season = "2025-26"
year = 2026
round_count = 7
expected_teams = 68

[pool]
id = 27
name = "March Radness 2026"

[paths]
data_dir = "output/2026"

[http]
ip_rotation = true

[http.retry]
max_attempts = 5
backoff_base_seconds = 3.0

[http.delay]
between_teams = 3.0
between_players = 0.5

[extraction]
stats_thru = "2026-03-16"
teams = [
    "Duke", "Arizona", "Michigan", "Florida",
    "Connecticut", "Purdue", "Iowa-State", "Houston",
    "Michigan-State", "Gonzaga", "Virginia", "Illinois",
    "Kansas", "Arkansas", "Alabama", "Nebraska",
    "St-Johns-NY", "Wisconsin", "Texas-Tech", "Vanderbilt",
    "Louisville", "Brigham-Young", "Tennessee", "North-Carolina",
    "UCLA", "Miami-FL", "Kentucky", "Saint-Marys-CA",
    "Ohio-State", "Villanova", "Georgia", "Clemson",
    "Texas-Christian", "Utah-State", "Saint-Louis", "Iowa",
    "Central-Florida", "Missouri", "Santa-Clara", "Texas-AM",
    "South-Florida", "Texas", "North-Carolina-State", "Miami-OH",
    "Southern-Methodist", "Virginia-Commonwealth",
    "Northern-Iowa", "High-Point", "Akron", "McNeese-State",
    "California-Baptist", "Hawaii", "Hofstra", "Troy",
    "North-Dakota-State", "Kennesaw-State", "Wright-State", "Pennsylvania",
    "Furman", "Queens-NC", "Tennessee-State", "Idaho",
    "Siena", "Long-Island-University", "Maryland-Baltimore-County", "Howard",
    "Prairie-View", "Lehigh",
]
```

- [ ] **Step 2: Commit**

```bash
git add data/seasons/2026.toml
git commit -m "feat: add 2026 season config"
```

---

### Task 8: Build the extraction module

**Files:**
- Create: `data/pipeline/extraction.py`

- [ ] **Step 1: Implement `extraction.py`**

This module replaces `pull_tournament_data.py`. It uses the scraper, HTTP, and manifest modules together.

```python
# data/pipeline/extraction.py
# ABOUTME: Orchestrates pulling team and player data from basketball-reference
# ABOUTME: Configures the scraper with an HTTP session, fetches data, writes CSVs
import logging
import time
from pathlib import Path

import pandas as pd

from pipeline.config import SeasonConfig
from pipeline.http import create_session, shutdown_session
from pipeline.manifest import RunManifest, configure_logging
from pipeline.scraper.utils import configure_session
from pipeline.scraper.ncaab.teams import Teams
from pipeline.scraper.ncaab.roster import Roster, Player

logger = logging.getLogger(__name__)


def pull_all(config: SeasonConfig, teams_only: bool = False, players_only: bool = False,
             retry_teams: list[str] | None = None, retry_players: list[str] | None = None) -> RunManifest:
    """Pull team and player data from basketball-reference.

    Args:
        config: Season configuration.
        teams_only: Only fetch team stats.
        players_only: Only fetch player stats.
        retry_teams: Only fetch these specific teams.
        retry_players: Only fetch these specific players by ID.

    Returns:
        RunManifest with results of the pull.
    """
    output_dir = str(Path(__file__).parent.parent / config.data_dir)
    configure_logging(output_dir)

    http_config = {
        "http": {
            "ip_rotation": config.ip_rotation,
            "retry": {
                "max_attempts": config.retry_max_attempts,
                "backoff_base_seconds": config.retry_backoff_base_seconds,
            },
        }
    }
    session = create_session(http_config)
    configure_session(session)

    tournament_teams = retry_teams or config.teams
    manifest = RunManifest(
        config_path=f"seasons/{config.year}.toml",
        expected_teams=config.expected_teams,
        output_dir=output_dir,
    )

    try:
        if retry_players:
            _pull_individual_players(
                retry_players, config, output_dir, manifest
            )
        else:
            fetch_teams = not players_only
            fetch_players = not teams_only

            if fetch_teams:
                _pull_team_stats(
                    tournament_teams, config, output_dir, manifest, retry_teams
                )
            if fetch_players:
                _pull_player_stats(
                    tournament_teams, config, output_dir, manifest, retry_teams
                )
    finally:
        manifest.save()
        shutdown_session(session)

    return manifest


def _pull_team_stats(teams: list[str], config: SeasonConfig,
                     output_dir: str, manifest: RunManifest,
                     is_retry: list[str] | None) -> None:
    """Fetch team stats via the Teams() bulk endpoint."""
    logger.info("Fetching team stats for %d teams", len(teams))
    teams_iter = Teams(config.year)
    team_stats = None
    remaining = [t.upper() for t in teams]

    for team in teams_iter:
        if not remaining:
            break
        if team.abbreviation not in remaining:
            continue
        remaining.remove(team.abbreviation)
        team_stats = pd.concat([team_stats, team.dataframe], axis=0)
        logger.info("Team stats [%d/%d] %s",
                     len(teams) - len(remaining), len(teams), team.abbreviation)

    if remaining:
        logger.warning("Missing team stats for: %s", remaining)

    if team_stats is not None:
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        stats_file = output_path / "team_stats.csv"

        if is_retry and stats_file.exists():
            existing = pd.read_csv(str(stats_file), index_col=0)
            team_stats = pd.concat([existing, team_stats], axis=0)
            team_stats = team_stats[~team_stats.index.duplicated(keep='last')]

        team_stats.to_csv(str(stats_file))
        manifest.set_output_file("team_stats", "team_stats.csv")
        logger.info("Saved %d team stats", len(team_stats))


def _pull_player_stats(teams: list[str], config: SeasonConfig,
                       output_dir: str, manifest: RunManifest,
                       is_retry: list[str] | None) -> None:
    """Fetch player stats by pulling rosters directly per team."""
    logger.info("Fetching player stats for %d teams", len(teams))
    season = config.season
    player_stats_list = []

    for i, team_name in enumerate(teams):
        abbrev = team_name.upper()
        if i > 0:
            time.sleep(config.delay_between_teams)

        try:
            roster = Roster(abbrev, year=config.year)
            player_count = 0
            for player in roster.players:
                if config.delay_between_players > 0:
                    time.sleep(config.delay_between_players)
                df = player.dataframe
                if df is not None and season in df.index:
                    row = df.loc[[season]].copy()
                    row['name'] = player.name
                    row['team_abbreviation'] = abbrev
                    row['player_id'] = player.player_id
                    player_stats_list.append(row)
                    player_count += 1
            manifest.record_team_success(abbrev, player_count)
            if player_count == 0:
                manifest.record_team_failure(abbrev)
        except Exception as e:
            logger.error("team %s: %s", abbrev, e)
            manifest.record_team_failure(abbrev)

    if player_stats_list:
        player_stats = pd.concat(player_stats_list, axis=0)
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        stats_file = output_path / "player_stats.csv"

        if is_retry and stats_file.exists():
            existing = pd.read_csv(str(stats_file), index_col=0)
            existing_teams = set(existing['team_abbreviation'].unique())
            new_teams = set(player_stats['team_abbreviation'].unique())
            existing = existing[~existing['team_abbreviation'].isin(new_teams)]
            player_stats = pd.concat([existing, player_stats], axis=0)

        player_stats.to_csv(str(stats_file))
        manifest.set_output_file("player_stats", "player_stats.csv")


def _pull_individual_players(player_ids: list[str], config: SeasonConfig,
                             output_dir: str, manifest: RunManifest) -> None:
    """Retry individual players by ID."""
    logger.info("Retrying %d individual players", len(player_ids))
    season = config.season
    player_stats_list = []

    for player_id in player_ids:
        try:
            player = Player(player_id)
            df = player.dataframe
            if df is not None and season in df.index:
                row = df.loc[[season]].copy()
                row['name'] = player.name
                row['player_id'] = player_id
                player_stats_list.append(row)
                logger.info("player %s: OK", player_id)
            else:
                logger.warning("player %s: no %s data", player_id, season)
        except Exception as e:
            logger.error("player %s: %s", player_id, e)
            manifest.record_player_failure(player_id)

    if player_stats_list:
        new_players = pd.concat(player_stats_list, axis=0)
        output_path = Path(output_dir)
        stats_file = output_path / "player_stats.csv"

        if stats_file.exists():
            existing = pd.read_csv(str(stats_file), index_col=0)
            combined = pd.concat([existing, new_players], axis=0)
            combined.to_csv(str(stats_file))
            logger.info("Merged %d new into %d existing", len(new_players), len(existing))
        else:
            new_players.to_csv(str(stats_file))
```

- [ ] **Step 2: Commit**

```bash
git add data/pipeline/extraction.py
git commit -m "feat: add extraction module for pulling tournament data"
```

---

### Task 9: Add `pull` command to the CLI

**Files:**
- Modify: `data/pipeline/cli.py`

- [ ] **Step 1: Add the `pull` subcommand to `cli.py`**

Add after the existing subparser definitions:

```python
# pull (data extraction from basketball-reference)
pull_parser = subparsers.add_parser(
    "pull",
    help="Pull team and player data from basketball-reference",
    description="Fetches team stats and player stats for tournament teams.",
)
pull_parser.add_argument("--season", type=int, required=True, help="Season year (e.g. 2026)")
pull_parser.add_argument("--teams-only", action="store_true", help="Only fetch team stats")
pull_parser.add_argument("--players-only", action="store_true", help="Only fetch player stats")
pull_parser.add_argument("--retry-teams", nargs="+", help="Retry specific teams")
pull_parser.add_argument("--retry-players", nargs="+", help="Retry specific players by ID")
```

Add to the handlers dict:

```python
"pull": _cmd_pull,
```

Add the handler function:

```python
def _cmd_pull(args):
    from pipeline.extraction import pull_all
    config = load_season_config(find_season_config(args.season))
    manifest = pull_all(
        config,
        teams_only=args.teams_only,
        players_only=args.players_only,
        retry_teams=args.retry_teams,
        retry_players=args.retry_players,
    )
    print(f"\nTeams: {manifest.teams_succeeded}/{manifest.expected_teams}")
    print(f"Players: {manifest.players_total}")
    if manifest.teams_failed:
        print(f"Failed teams: {manifest.teams_failed}")
    if manifest.players_failed:
        print(f"Failed players: {manifest.players_failed}")
    for cmd in manifest.retry_commands():
        print(f"  Retry: {cmd}")
```

- [ ] **Step 2: Verify the CLI shows the new command**

```bash
cd data && python -m pipeline --help
```

Expected: `pull` appears in the list of available commands

- [ ] **Step 3: Commit**

```bash
git add data/pipeline/cli.py
git commit -m "feat: add pull command to pipeline CLI"
```

---

## Chunk 4: Data Migration and Cleanup

### Task 10: Migrate existing data to output/ structure

**Files:**
- Move: `data/2023/*` → `data/output/2023/`
- Move: `data/2024/*` → `data/output/2024/`
- Move: `data/2025/*` → `data/output/2025/`
- Move: `data/2026/*` → `data/output/2026/`

- [ ] **Step 1: Create output directory structure**

```bash
mkdir -p data/output
```

- [ ] **Step 2: Move year directories**

```bash
git mv data/2023 data/output/2023
git mv data/2024 data/output/2024
git mv data/2025 data/output/2025
git mv data/2026 data/output/2026
```

- [ ] **Step 3: Remove `load_2026.py`** (replaced by `pipeline load-data`)

```bash
git rm data/load_2026.py
```

- [ ] **Step 4: Update any references to old paths**

Check for hardcoded paths in notebooks and config:

```bash
grep -rn "data/2023\|data/2024\|data/2025\|data/2026" data/*.ipynb data/pipeline/ data/seasons/
```

Update any references found to use the new `data/output/{year}/` paths.

- [ ] **Step 5: Commit**

```bash
git add -A data/output/ data/2023 data/2024 data/2025 data/2026 data/load_2026.py
git commit -m "chore: migrate year data to output/ directory structure"
```

---

### Task 11: Create season config for 2025 (reference)

**Files:**
- Create: `data/seasons/2025.toml`

- [ ] **Step 1: Create `data/seasons/2025.toml`**

Based on the existing 2025 pool data (competition_id=6, pool_id=19):

```toml
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
data_dir = "output/2025"

[http]
ip_rotation = true

[http.retry]
max_attempts = 5
backoff_base_seconds = 3.0

[http.delay]
between_teams = 3.0
between_players = 0.5

[extraction]
stats_thru = "2025-03-16"
teams = [
    "Auburn", "Duke", "Houston", "Florida",
    "Tennessee", "Alabama", "Michigan-State", "St-Johns-NY",
    "Texas-Tech", "Iowa-State", "Kentucky", "Wisconsin",
    "Texas-AM", "Purdue", "Maryland", "Arizona",
    "Michigan", "Clemson", "Oregon", "Memphis",
    "Brigham-Young", "Illinois", "Missouri", "Mississippi",
    "UCLA", "Marquette", "Saint-Marys-CA", "Kansas",
    "Louisville", "Gonzaga", "Connecticut", "Mississippi-State",
    "Creighton", "Georgia", "Baylor", "Oklahoma",
    "Arkansas", "New-Mexico", "Vanderbilt", "Utah-State",
    "Texas", "Xavier", "California-San-Diego", "Drake",
    "Virginia-Commonwealth", "North-Carolina", "San-Diego", "Colorado-State",
    "McNeese-State", "Liberty", "Yale", "High-Point",
    "Akron", "Grand-Canyon", "Lipscomb", "Troy",
    "North-Carolina-Wilmington", "Montana", "Robert-Morris", "Wofford",
    "Nebraska-Omaha", "Bryant", "Norfolk-State",
    "Southern-Illinois-Edwardsville", "American", "Mount-St-Marys",
    "Alabama-State", "Saint-Francis-Pa",
]
```

- [ ] **Step 2: Commit**

```bash
git add data/seasons/2025.toml
git commit -m "feat: add 2025 season config as reference"
```

---

### Task 12: End-to-end verification

- [ ] **Step 1: Verify scraper imports work standalone**

```bash
cd data && python -c "
from pipeline.scraper import Teams, Team, Roster, Player
print('Scraper imports OK')
print(f'Teams: {Teams.__module__}')
print(f'Roster: {Roster.__module__}')
"
```

Expected: imports succeed, modules point to `pipeline.scraper.ncaab.*`

- [ ] **Step 2: Verify CLI shows all commands**

```bash
cd data && python -m pipeline --help
```

Expected: `pull` and `load-data` both appear

- [ ] **Step 3: Verify season config loads**

```bash
cd data && python -c "
from pipeline.config import load_season_config, find_season_config
config = load_season_config(find_season_config(2026))
print(f'Year: {config.year}')
print(f'Teams: {len(config.teams)}')
print(f'IP rotation: {config.ip_rotation}')
print(f'Retry max: {config.retry_max_attempts}')
"
```

Expected: prints 2026, 68 teams, IP rotation true, 5 retries

- [ ] **Step 4: Run all tests**

```bash
cd data && python -m pytest pipeline/tests/ -v
```

Expected: all tests pass

- [ ] **Step 5: Final commit and merge**

```bash
git add -A
git commit -m "chore: end-to-end verification of sportsipy separation"
git checkout main
git merge staff/sportsipy-separation
```
