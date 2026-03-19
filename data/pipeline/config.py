# ABOUTME: Loads and validates season configuration from TOML files
# ABOUTME: Each season has a TOML config with competition, pool, and path settings
import sys
from dataclasses import dataclass, field
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
    ip_rotation: bool = False
    retry_max_attempts: int = 5
    retry_backoff_base_seconds: float = 3.0
    delay_between_teams: float = 3.0
    delay_between_players: float = 0.5
    teams: list = field(default_factory=list)
    stats_thru: str = ""


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
    http = data.get("http", {})
    retry = http.get("retry", {})
    delay = http.get("delay", {})
    extraction = data.get("extraction", {})

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
        ip_rotation=http.get("ip_rotation", False),
        retry_max_attempts=retry.get("max_attempts", 5),
        retry_backoff_base_seconds=retry.get("backoff_base_seconds", 3.0),
        delay_between_teams=delay.get("between_teams", 3.0),
        delay_between_players=delay.get("between_players", 0.5),
        teams=extraction.get("teams", []),
        stats_thru=extraction.get("stats_thru", ""),
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
            f"Create one by copying an existing config: "
            f"cp data/seasons/2025.toml data/seasons/{year}.toml"
        )
    return str(config_path)
