# ABOUTME: Parses game scoring CSVs and records results to the database
# ABOUTME: Handles player scores, losing teams, inactive players, and game schedules
import csv
import os
from dataclasses import dataclass, field
from typing import Any, Dict, List


@dataclass
class ScoringResult:
    """Parsed results from a game scoring CSV."""
    player_games: List[Dict[str, Any]] = field(default_factory=list)
    losing_teams: List[str] = field(default_factory=list)
    inactive_players: List[str] = field(default_factory=list)


def parse_game_scoring_csv(csv_path: str) -> ScoringResult:
    """Parse a game scoring CSV into structured data.

    Extracts player game scores, losing teams (marked 'L'), and
    inactive players (marked 'I') from the scoring spreadsheet.

    Args:
        csv_path: Path to the scoring CSV file.

    Returns:
        ScoringResult with player_games, losing_teams, and inactive_players.

    Raises:
        FileNotFoundError: If csv_path does not exist.
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Scoring CSV not found: {csv_path}")

    player_games: List[Dict[str, Any]] = []
    losing_teams: List[str] = []
    inactive_players: List[str] = []

    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            lost = row.get("lost", "").strip()
            if lost.upper() == "L":
                losing_teams.append(row["team_unique"])

            inactive = row.get("inactive", "").strip()
            if inactive.upper() == "I":
                inactive_players.append(row["player_unique"])

            points = row.get("points", "").strip()
            if points != "":
                player_games.append({
                    "player_unique": row["player_unique"],
                    "game_id": row["game_id"],
                    "points": int(points),
                })

    return ScoringResult(
        player_games=player_games,
        losing_teams=losing_teams,
        inactive_players=inactive_players,
    )


def update_scores_from_csv(
    csv_path: str,
    current_round: int,
    competition_id: int,
    supabase: Any,
) -> ScoringResult:
    """Parse a scoring CSV and write results to the database.

    Args:
        csv_path: Path to the scoring CSV file.
        current_round: Current tournament round number.
        competition_id: The competition to update.
        supabase: Supabase client instance.

    Returns:
        ScoringResult with the parsed data.
    """
    result = parse_game_scoring_csv(csv_path)

    supabase.table("player_game").upsert(
        result.player_games,
        ignore_duplicates=False,
        on_conflict="game_id, player_unique",
    ).execute()

    supabase.table("competition_updated").insert({
        "competition_id": competition_id,
        "current_round": current_round,
    }).execute()

    for team in result.losing_teams:
        supabase.table("team_competition").update(
            {"round_eliminated": current_round}
        ).eq("team_unique", team).eq(
            "competition_id", competition_id
        ).execute()

    for player in result.inactive_players:
        supabase.table("player_competition").update(
            {"inactive": True}
        ).eq("player_unique", player).eq(
            "competition_id", competition_id
        ).execute()

    return result


def update_game_schedule(csv_path: str, supabase: Any) -> None:
    """Load a game schedule CSV and upsert games into the database.

    Args:
        csv_path: Path to the game schedule CSV file.
        supabase: Supabase client instance.
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Game schedule CSV not found: {csv_path}")

    game_insert = []
    empty_row = {
        "game_date": "",
        "team_2_id": "",
        "team_1_id": "",
        "game_time": "",
        "round_num": "",
        "competition_id": "",
    }

    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row != empty_row:
                game_insert.append(row)

    supabase.table("game").upsert(
        game_insert,
        on_conflict="game_date, team_1_id, team_2_id",
    ).execute()


def generate_game_scoring_sheet(
    date: str,
    competition_id: int,
    year: int,
    data_dir: str,
    supabase: Any,
) -> str:
    """Generate a blank scoring sheet CSV for a given game date.

    Queries players_in_games_view for the date, then writes a CSV
    with empty points/lost/inactive columns for manual scoring entry.

    Args:
        date: Game date string (YYYY-MM-DD).
        competition_id: The competition to query.
        year: Season year (used in filename).
        data_dir: Base data directory for output.
        supabase: Supabase client instance.

    Returns:
        Path to the generated CSV file.
    """
    data = supabase.table("players_in_games_view").select("*").eq(
        "game_date", date
    ).eq("competition_id", competition_id).execute()

    scores_dir = os.path.join(data_dir, "scores")
    os.makedirs(scores_dir, exist_ok=True)

    output_path = os.path.join(
        scores_dir,
        f"{date}-game-scoring-{year}-ncaa-tournament.csv",
    )

    columns = [
        "game_time", "team_unique", "lost", "player_unique",
        "points", "inactive", "game_id",
    ]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        for row in data.data:
            output_row = {col: row.get(col, "") for col in columns}
            output_row["points"] = ""
            output_row["lost"] = ""
            output_row["inactive"] = ""
            writer.writerow(output_row)

    return output_path
