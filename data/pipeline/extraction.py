# ABOUTME: Orchestrates pulling NCAA tournament data from basketball-reference.com
# ABOUTME: Replaces the standalone pull_tournament_data.py script with session-managed extraction
import logging
import time
from pathlib import Path

import pandas as pd

from pipeline.config import SeasonConfig
from pipeline.http import create_session, shutdown_session
from pipeline.manifest import RunManifest
from pipeline.scraper.utils import configure_session

logger = logging.getLogger(__name__)


def pull_all(
    config: SeasonConfig,
    config_path: str,
    teams_only: bool = False,
    players_only: bool = False,
    retry_teams: list[str] | None = None,
    retry_players: list[str] | None = None,
) -> RunManifest:
    """Pull tournament team and player stats from basketball-reference.

    Args:
        config: Season configuration with connection and path settings.
        config_path: Path to the config file, recorded in the manifest.
        teams_only: Pull only team stats, skip player stats.
        players_only: Pull only player stats, skip team stats.
        retry_teams: If set, only re-pull stats for these team abbreviations.
        retry_players: If set, only re-pull stats for these player IDs.

    Returns:
        RunManifest tracking all successes and failures for this run.
    """
    output_dir = str(Path(__file__).parent.parent / config.data_dir)
    manifest = RunManifest(
        config_path=config_path,
        expected_teams=config.expected_teams,
        output_dir=output_dir,
    )

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

    try:
        if retry_players:
            _pull_retry_players(config, retry_players, output_dir, manifest)
        elif retry_teams:
            _pull_retry_teams(config, retry_teams, output_dir, manifest)
        else:
            if not players_only:
                _pull_teams(config, output_dir, manifest)
            if not teams_only:
                _pull_players(config, output_dir, manifest)
    finally:
        manifest.save()
        shutdown_session(session)

    return manifest


def _tournament_team_abbreviations(config: SeasonConfig) -> set[str]:
    """Return the set of tournament team abbreviations in uppercase."""
    return {t.upper() for t in config.teams}


def _pull_teams(config: SeasonConfig, output_dir: str, manifest: RunManifest) -> None:
    """Pull season stats for all tournament teams via the Teams bulk endpoint."""
    from pipeline.scraper.ncaab.teams import Teams

    logger.info("Pulling team stats for %d teams (year=%d)", config.expected_teams, config.year)
    tournament_teams_upper = _tournament_team_abbreviations(config)

    team_stats = pd.DataFrame()
    teams_iter = Teams(config.year)

    for team in teams_iter:
        abbrev = team.abbreviation
        if abbrev not in tournament_teams_upper:
            continue
        try:
            df = team.dataframe
            if df is not None:
                team_stats = pd.concat([team_stats, df], axis=0)
                logger.info("team stats: pulled %s", abbrev)
            else:
                logger.warning("team stats: no dataframe for %s", abbrev)
        except Exception as exc:
            logger.error("team stats: error pulling %s: %s", abbrev, exc)

    if team_stats.empty:
        logger.warning("No team stats collected")
        return

    output_path = Path(output_dir) / "team_stats.csv"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    team_stats.to_csv(output_path)
    manifest.set_output_file("team_stats", str(output_path))
    logger.info("Team stats written to %s (%d rows)", output_path, len(team_stats))


def _pull_players(config: SeasonConfig, output_dir: str, manifest: RunManifest) -> None:
    """Pull player stats for each tournament team via Roster."""
    from pipeline.scraper.ncaab.roster import Roster

    tournament_teams = list(_tournament_team_abbreviations(config))
    logger.info("Pulling player stats for %d teams", len(tournament_teams))

    player_stats = pd.DataFrame()

    for abbrev in tournament_teams:
        logger.info("Pulling roster for %s", abbrev)
        time.sleep(config.delay_between_teams)
        try:
            roster = Roster(abbrev, year=config.year)
            team_player_stats = _collect_player_rows(roster.players, abbrev, config)
            if team_player_stats.empty:
                logger.warning("No player stats collected for %s", abbrev)
                manifest.record_team_failure(abbrev)
                continue
            player_stats = pd.concat([player_stats, team_player_stats], axis=0)
            manifest.record_team_success(abbrev, len(team_player_stats))
        except Exception as exc:
            logger.error("Failed to pull roster for %s: %s", abbrev, exc)
            manifest.record_team_failure(abbrev)

    if player_stats.empty:
        logger.warning("No player stats collected across all teams")
        return

    output_path = Path(output_dir) / "player_stats.csv"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    player_stats.to_csv(output_path)
    manifest.set_output_file("player_stats", str(output_path))
    logger.info("Player stats written to %s (%d rows)", output_path, len(player_stats))


def _collect_player_rows(
    players: list,
    team_abbrev: str,
    config: SeasonConfig,
) -> pd.DataFrame:
    """Pull and assemble one row per player for the configured season."""
    rows = []
    for player in players:
        time.sleep(config.delay_between_players)
        try:
            df = player.dataframe
            if df is None:
                logger.warning("No dataframe for player %s", player.player_id)
                continue
            if config.season not in df.index:
                logger.debug(
                    "Season %s not found for player %s (available: %s)",
                    config.season,
                    player.player_id,
                    list(df.index),
                )
                continue
            row = df.loc[[config.season]].copy()
            row["name"] = player.name
            row["team_abbreviation"] = team_abbrev
            row["player_id"] = player.player_id
            rows.append(row)
        except Exception as exc:
            logger.error("Error pulling player %s: %s", getattr(player, "player_id", "?"), exc)

    if not rows:
        return pd.DataFrame()
    return pd.concat(rows, axis=0)


def _pull_retry_teams(
    config: SeasonConfig,
    retry_teams: list[str],
    output_dir: str,
    manifest: RunManifest,
) -> None:
    """Re-pull team stats for specific abbreviations and merge into existing CSV."""
    from pipeline.scraper.ncaab.teams import Teams

    logger.info("Retrying team stats for: %s", retry_teams)
    retry_upper = {t.upper() for t in retry_teams}

    new_stats = pd.DataFrame()
    teams_iter = Teams(config.year)

    for team in teams_iter:
        abbrev = team.abbreviation
        if abbrev not in retry_upper:
            continue
        try:
            df = team.dataframe
            if df is not None:
                new_stats = pd.concat([new_stats, df], axis=0)
                logger.info("retry team stats: pulled %s", abbrev)
        except Exception as exc:
            logger.error("retry team stats: error pulling %s: %s", abbrev, exc)

    output_path = Path(output_dir) / "team_stats.csv"
    existing = _load_existing_csv(output_path)

    if existing is not None and not new_stats.empty:
        # Deduplicate on index (team abbreviation), preferring new data
        merged = pd.concat([existing, new_stats], axis=0)
        merged = merged[~merged.index.duplicated(keep="last")]
        merged.to_csv(output_path)
        logger.info("Merged team stats written to %s (%d rows)", output_path, len(merged))
    elif not new_stats.empty:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        new_stats.to_csv(output_path)
        logger.info("Team stats written to %s (%d rows)", output_path, len(new_stats))
    else:
        logger.warning("No team stats collected during retry")

    manifest.set_output_file("team_stats", str(output_path))


def _pull_retry_players(
    config: SeasonConfig,
    retry_players: list[str],
    output_dir: str,
    manifest: RunManifest,
) -> None:
    """Re-pull player stats for specific player IDs and merge into existing CSV."""
    from pipeline.scraper.ncaab.roster import Player

    logger.info("Retrying player stats for %d players", len(retry_players))

    rows = []
    for player_id in retry_players:
        time.sleep(config.delay_between_players)
        try:
            player = Player(player_id)
            df = player.dataframe
            if df is None:
                logger.warning("No dataframe for player %s", player_id)
                manifest.record_player_failure(player_id)
                continue
            if config.season not in df.index:
                logger.warning(
                    "Season %s not found for player %s; skipping", config.season, player_id
                )
                manifest.record_player_failure(player_id)
                continue
            row = df.loc[[config.season]].copy()
            row["name"] = player.name
            row["player_id"] = player_id
            rows.append(row)
            logger.info("retry player: pulled %s", player_id)
        except Exception as exc:
            logger.error("retry player: error pulling %s: %s", player_id, exc)
            manifest.record_player_failure(player_id)

    if not rows:
        logger.warning("No player stats collected during player retry")
        return

    new_stats = pd.concat(rows, axis=0)
    output_path = Path(output_dir) / "player_stats.csv"
    existing = _load_existing_csv(output_path)

    if existing is not None:
        # Remove stale rows for these player IDs, then append fresh data
        id_col = "player_id" if "player_id" in existing.columns else None
        if id_col:
            existing = existing[~existing[id_col].isin(retry_players)]
        merged = pd.concat([existing, new_stats], axis=0)
        merged.to_csv(output_path)
        logger.info("Merged player stats written to %s (%d rows)", output_path, len(merged))
    else:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        new_stats.to_csv(output_path)
        logger.info("Player stats written to %s (%d rows)", output_path, len(new_stats))

    manifest.set_output_file("player_stats", str(output_path))


def _load_existing_csv(path: Path) -> pd.DataFrame | None:
    """Load an existing CSV, returning None if it doesn't exist."""
    if not path.exists():
        return None
    try:
        return pd.read_csv(path, index_col=0)
    except Exception as exc:
        logger.warning("Could not read existing CSV at %s: %s", path, exc)
        return None
