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

    file_handler = logging.FileHandler(output_path / "run.log")
    file_handler.setFormatter(logging.Formatter(log_format, date_format))

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(log_format, date_format))

    pipeline_logger = logging.getLogger("pipeline")
    pipeline_logger.setLevel(level)
    pipeline_logger.addHandler(file_handler)
    pipeline_logger.addHandler(console_handler)
