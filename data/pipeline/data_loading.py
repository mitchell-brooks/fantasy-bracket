# ABOUTME: Loads and transforms CSV data for rounds, conferences, teams, and players
# ABOUTME: Pure data transformation functions plus DB insertion wrappers
from __future__ import annotations

import csv
from datetime import date
from pathlib import Path
from typing import Any

from pipeline.config import SeasonConfig


def _validate_csv(path: str, required_columns: set[str]) -> str:
    """Validate that a CSV file exists and contains required columns.

    Args:
        path: Path to the CSV file.
        required_columns: Set of column names that must be present.

    Returns:
        The validated path string.

    Raises:
        FileNotFoundError: If the file does not exist.
        ValueError: If required columns are missing from the CSV header.
    """
    csv_path = Path(path)
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {path}")

    with open(csv_path, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames is None:
            raise ValueError(f"CSV file has no headers: {path}")
        header_set = set(reader.fieldnames)

    missing = required_columns - header_set
    if missing:
        raise ValueError(
            f"CSV {path} is missing required columns: {', '.join(sorted(missing))}"
        )
    return path


# --- Rounds ---

_ROUND_REQUIRED_COLUMNS = {"round_num", "round_name", "round_start", "round_end"}


def generate_rounds(csv_path: str, competition_id: int) -> list[dict[str, Any]]:
    """Parse a rounds CSV and attach competition_id to each row.

    Args:
        csv_path: Path to the rounds CSV file.
        competition_id: Competition ID to attach to each round.

    Returns:
        List of round dicts ready for DB insertion.

    Raises:
        FileNotFoundError: If the CSV file does not exist.
        ValueError: If required columns are missing.
    """
    _validate_csv(csv_path, _ROUND_REQUIRED_COLUMNS)
    rounds_insert: list[dict[str, Any]] = []
    with open(csv_path, mode="r", encoding="utf-8-sig") as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            row["competition_id"] = competition_id
            rounds_insert.append(dict(row))
    return rounds_insert


def add_rounds_to_db(csv_path: str, competition_id: int, supabase_client: Any) -> None:
    """Generate rounds from CSV and upsert into the database."""
    supabase_client.table("competitionround").upsert(
        generate_rounds(csv_path, competition_id),
        ignore_duplicates=True,
        on_conflict="round_num, competition_id",
    ).execute()


# --- Conferences ---

_CONFERENCE_REQUIRED_COLUMNS = {"conference_unique", "conference_name"}


def generate_conferences(csv_path: str, league_unique: str) -> list[dict[str, Any]]:
    """Parse a conferences CSV, keeping only relevant columns.

    Lowercases conference_unique and league_unique.

    Args:
        csv_path: Path to the conferences CSV file.
        league_unique: League identifier (will be lowercased).

    Returns:
        List of conference dicts ready for DB insertion.
    """
    _validate_csv(csv_path, _CONFERENCE_REQUIRED_COLUMNS)
    conferences_insert: list[dict[str, Any]] = []
    with open(csv_path, mode="r", encoding="utf-8-sig") as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            trimmed_row = {
                key: row[key].lower() if key == "conference_unique" else row[key]
                for key in row.keys() & {"conference_unique", "conference_name"}
            }
            trimmed_row["league_unique"] = league_unique.lower()
            conferences_insert.append(trimmed_row)
    return conferences_insert


def add_conferences_to_db(
    csv_path: str, league_unique: str, supabase_client: Any
) -> None:
    """Generate conferences from CSV and insert into the database."""
    supabase_client.table("conference").insert(
        generate_conferences(csv_path, league_unique)
    ).execute()


# --- Teams ---

_TEAM_SEEDS_REQUIRED_COLUMNS = {
    "team_unique", "seed", "overall_seed", "region", "round_started",
}

_TEAM_STATS_REQUIRED_COLUMNS = {"abbreviation", "name", "conference"}

_TEAM_STAT_KEYS = {
    "effective_field_goal_percentage",
    "strength_of_schedule",
    "assist_percentage",
    "free_throw_attempt_rate",
    "offensive_rating",
    "opp_effective_field_goal_percentage",
    "two_point_field_goal_percentage",
    "three_point_field_goal_percentage",
    "pace",
    "three_point_attempt_rate",
    "true_shooting_percentage",
    "turnover_percentage",
}

_TEAM_WIN_LOSS_KEYS = {
    "games_played", "wins", "losses", "conference_wins", "conference_losses",
}


def generate_teams(
    team_stats_csv: str,
    team_seeds_csv: str,
    league_unique: str,
    competition_id: int,
    expected_num_teams: int,
    thru: Any = None,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Parse team stats and seeds CSVs, merge them into DB-ready dicts.

    Args:
        team_stats_csv: Path to team stats CSV.
        team_seeds_csv: Path to team seeds CSV.
        league_unique: League identifier.
        competition_id: Competition ID.
        expected_num_teams: Expected count; raises ValueError on mismatch.
        thru: Date the stats are current through. Defaults to today.

    Returns:
        Tuple of (team_inserts, team_competition_inserts).

    Raises:
        ValueError: If team counts don't match expected_num_teams.
    """
    if thru is None:
        thru = date.today()

    _validate_csv(team_seeds_csv, _TEAM_SEEDS_REQUIRED_COLUMNS)
    _validate_csv(team_stats_csv, _TEAM_STATS_REQUIRED_COLUMNS)

    team_insert: list[dict[str, Any]] = []
    team_competition_insert: list[dict[str, Any]] = []
    team_seed_dict: dict[str, dict[str, Any]] = {}

    with open(team_seeds_csv, mode="r", encoding="utf-8-sig") as csv_file:
        seeds_csv_reader = csv.DictReader(csv_file)
        for row in seeds_csv_reader:
            team_seed_row = {
                key: row[key].lower() if key == "team_unique" else row[key]
                for key in row.keys()
                & {"team_unique", "seed", "overall_seed", "region", "round_started"}
            }
            team_seed_row["competition_id"] = competition_id
            team_seed_row["league_unique"] = league_unique
            team_seed_dict[team_seed_row["team_unique"]] = team_seed_row

    if len(team_seed_dict) != expected_num_teams:
        raise ValueError(
            f"Number of teams in seed file ({len(team_seed_dict)}) "
            f"does not match expected number of teams ({expected_num_teams})"
        )

    with open(team_stats_csv, mode="r", encoding="utf-8-sig") as csv_file:
        stats_csv_reader = csv.DictReader(csv_file)
        for row in stats_csv_reader:
            team_unique = row["abbreviation"].lower()
            if team_unique.endswith("/women"):
                team_unique = team_unique[: -len("/women")]
            if team_unique.endswith("/men"):
                team_unique = team_unique[: -len("/men")]

            team_row = {
                "league_unique": league_unique,
                "team_unique": team_unique,
                "team_name": row["name"],
            }
            team_insert.append(team_row)

            team_seed_dict[team_unique]["team_stats"] = {
                key: float(row[key]) if row[key] else 0
                for key in row.keys() & _TEAM_STAT_KEYS
            }
            team_seed_dict[team_unique]["team_win_loss"] = {
                key: float(row[key]) if row[key] else 0
                for key in row.keys() & _TEAM_WIN_LOSS_KEYS
            }
            team_seed_dict[team_unique]["team_stats"]["conference"] = row[
                "conference"
            ].lower()
            team_seed_dict[team_unique]["stats_thru"] = thru
            team_competition_insert.append(team_seed_dict[team_unique])

    if len(team_insert) != expected_num_teams or len(team_competition_insert) != expected_num_teams:
        raise ValueError(
            f"Number of teams in csv does not match expected number of teams "
            f"after stat processing"
        )

    return (team_insert, team_competition_insert)


def add_teams_to_db(
    team_stats_csv: str,
    team_seeds_csv: str,
    league_unique: str,
    competition_id: int,
    expected_num_teams: int,
    thru: Any,
    supabase_client: Any,
) -> None:
    """Generate teams from CSV and upsert into the database."""
    teams, team_competition = generate_teams(
        team_stats_csv, team_seeds_csv, league_unique,
        competition_id, expected_num_teams, thru,
    )
    supabase_client.table("team").upsert(
        teams, ignore_duplicates=True,
        on_conflict="team_unique, league_unique",
    ).execute()
    supabase_client.table("team_competition").upsert(
        team_competition, ignore_duplicates=False,
        on_conflict="team_unique, competition_id, league_unique",
    ).execute()


# --- Players ---

_PLAYER_REQUIRED_COLUMNS = {"player_id", "name", "team_abbreviation"}

_PLAYER_STAT_KEYS = {
    "points", "assists", "blocks", "minutes_played",
    "effective_field_goal_percentage", "field_goals", "field_goal_attempts",
    "field_goal_percentage", "two_pointers", "two_point_attempts",
    "two_point_percentage", "three_pointers", "three_point_attempts",
    "three_point_percentage", "free_throws", "free_throw_attempts",
    "free_throw_percentage", "free_throw_attempt_rate",
    "offensive_rebounds", "defensive_rebounds", "steals", "turnovers",
    "personal_fouls", "usage_percentage", "true_shooting_percentage",
    "player_efficiency_rating", "games_played", "games_started",
}


def generate_players(
    player_stats_csv: str,
    competition_id: int,
    league_unique: str,
    thru: Any = None,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    """Parse a player stats CSV into DB-ready dicts.

    Args:
        player_stats_csv: Path to player stats CSV.
        competition_id: Competition ID.
        league_unique: League identifier.
        thru: Date the stats are current through. Defaults to today.

    Returns:
        Tuple of (player_inserts, player_competition_inserts, player_stat_inserts).

    Raises:
        FileNotFoundError: If the CSV file does not exist.
        ValueError: If required columns are missing.
    """
    if thru is None:
        thru = date.today()

    _validate_csv(player_stats_csv, _PLAYER_REQUIRED_COLUMNS)

    player_insert: list[dict[str, Any]] = []
    player_competition_insert: list[dict[str, Any]] = []
    player_stat_insert: list[dict[str, Any]] = []

    with open(player_stats_csv, mode="r", encoding="utf-8-sig") as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            player_unique = row["player_id"].lower()
            team_unique = row["team_abbreviation"].lower()

            player_row: dict[str, Any] = {
                "player_unique": player_unique,
                "player_name": row["name"],
            }
            if "birthdate" in row:
                player_row["birthdate"] = row["birthdate"]
            if "position" in row:
                player_row["position"] = row["position"]

            player_stats = {
                key: float(row[key]) if row[key] else 0
                for key in row.keys() & _PLAYER_STAT_KEYS
            }
            player_stats["rebounds"] = (
                int(float(row["total_rebounds"])) if row.get("total_rebounds") else 0
            )

            player_competition_row = {
                "player_unique": player_unique,
                "competition_id": competition_id,
                "league_unique": league_unique,
                "team_unique": team_unique,
                "inactive": False,
                "stats_thru": thru,
                "player_stats": player_stats,
            }

            player_insert.append(player_row)
            player_competition_insert.append(player_competition_row)
            player_stat_insert.append(player_stats)

    return (player_insert, player_competition_insert, player_stat_insert)


def add_players_to_db(
    player_stats_csv: str,
    competition_id: int,
    league_unique: str,
    thru: Any,
    supabase_client: Any,
) -> None:
    """Generate players from CSV and upsert into the database."""
    players, player_competition, _ = generate_players(
        player_stats_csv, competition_id, league_unique, thru,
    )
    supabase_client.table("player").upsert(
        players, ignore_duplicates=True,
        on_conflict="player_unique",
    ).execute()
    supabase_client.table("player_competition").upsert(
        player_competition, ignore_duplicates=False,
        on_conflict="player_unique,competition_id",
    ).execute()


# --- Orchestrator ---


def load_all(config: SeasonConfig, supabase_client: Any) -> dict[str, int]:
    """Load all data for a season into the database.

    Loads rounds, conferences, teams, and players in dependency order.

    Args:
        config: Season configuration with paths and IDs.
        supabase_client: Authenticated Supabase client.

    Returns:
        Dict with counts of loaded entities.
    """
    data_dir = config.data_dir

    rounds_csv = f"{data_dir}/rounds-{config.year}-ncaa-tournament.csv"
    add_rounds_to_db(rounds_csv, config.competition_id, supabase_client)
    rounds = generate_rounds(rounds_csv, config.competition_id)

    team_stats_csv = f"{data_dir}/{config.year}_ncaa_tournament_team_stats.csv"
    team_seeds_csv = f"{data_dir}/{config.year}_ncaa_tournament_team_seeds.csv"
    add_teams_to_db(
        team_stats_csv, team_seeds_csv,
        "ncaambb", config.competition_id,
        config.expected_teams, date.today(), supabase_client,
    )
    teams, _ = generate_teams(
        team_stats_csv, team_seeds_csv,
        "ncaambb", config.competition_id, config.expected_teams,
    )

    player_stats_csv = f"{data_dir}/{config.year}_ncaa_tournament_player_stats.csv"
    add_players_to_db(
        player_stats_csv, config.competition_id,
        "ncaambb", date.today(), supabase_client,
    )
    players, _, _ = generate_players(
        player_stats_csv, config.competition_id, "ncaambb",
    )

    return {
        "rounds": len(rounds),
        "teams": len(teams),
        "players": len(players),
    }
