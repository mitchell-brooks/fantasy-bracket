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
        description=(
            "Creates a CSV template with all players in games on the given date. "
            "Fill in points, losses, and injuries, then use record-scores."
        ),
    )
    score_sheet_parser.add_argument("--date", required=True, help="Game date (YYYY-MM-DD)")
    score_sheet_parser.add_argument("--season", type=int, required=True, help="Season year")

    # record-scores
    record_parser = subparsers.add_parser(
        "record-scores",
        help="Record game scores from a filled-in scoring CSV",
        description=(
            "Processes a scoring CSV to record player points, "
            "team eliminations, and player injuries."
        ),
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
        description=(
            "Runs the snake draft algorithm using submitted rankings "
            "and autodraft for remaining picks."
        ),
    )
    draft_parser.add_argument("--pool", type=int, required=True, help="Pool ID")
    draft_parser.add_argument("--draft-num", type=int, required=True, help="Draft number")
    draft_parser.add_argument(
        "--strategy",
        default="TOURNAMENT_POINTS",
        choices=["RANDOM", "TOURNAMENT_POINTS"],
        help="Autodraft strategy for unranked players (default: TOURNAMENT_POINTS)",
    )

    # maintain-rosters
    maintain_parser = subparsers.add_parser(
        "maintain-rosters",
        help="Drop inactive players and fill rosters to target size",
        description=(
            "Removes players who were injured/inactive before the draft round, "
            "then fills empty roster slots using the draft order and autodraft strategy."
        ),
    )
    maintain_parser.add_argument("--pool", type=int, required=True, help="Pool ID")
    maintain_parser.add_argument("--draft-num", type=int, required=True, help="Draft number")
    maintain_parser.add_argument(
        "--strategy",
        default="TOURNAMENT_POINTS",
        choices=["RANDOM", "TOURNAMENT_POINTS"],
        help="Autodraft strategy (default: TOURNAMENT_POINTS)",
    )

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    # Dispatch to command handlers
    handlers = {
        "load-data": _cmd_load_data,
        "generate-scoring-sheet": _cmd_generate_scoring_sheet,
        "record-scores": _cmd_record_scores,
        "update-schedule": _cmd_update_schedule,
        "run-draft": _cmd_run_draft,
        "maintain-rosters": _cmd_maintain_rosters,
    }
    handlers[args.command](args)


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
    csv_path = (
        f"{config.data_dir}/scores/"
        f"{args.date}-game-scoring-{config.year}-ncaa-tournament.csv"
    )
    result = update_scores_from_csv(
        csv_path=csv_path,
        current_round=args.round,
        competition_id=config.competition_id,
        supabase=supabase,
    )
    print(f"Recorded: {len(result.player_games)} scores, "
          f"{len(result.losing_teams)} eliminations, "
          f"{len(result.inactive_players)} injuries")


def _cmd_update_schedule(args):
    from pipeline.game_recording import update_game_schedule
    config = load_season_config(find_season_config(args.season))
    supabase = get_client()
    csv_path = (
        f"{config.data_dir}/schedules/"
        f"game-schedule-round-{args.round}-{config.year}-ncaa-tournament.csv"
    )
    update_game_schedule(csv_path, supabase)
    print(f"Updated schedule for round {args.round}")


def _cmd_run_draft(args):
    from pipeline.draft import run_draft
    supabase = get_client()
    result = run_draft(
        pool_id=args.pool,
        draft_num=args.draft_num,
        strategy=args.strategy,
        supabase=supabase,
    )
    print(f"Draft complete: {len(result)} picks made")


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
