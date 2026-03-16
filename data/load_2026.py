"""Load 2026 NCAA tournament data into Supabase.

Loads rounds, teams, and players for competition_id=8 (2026 NCAA tournament).
Uses the same logic as load-data.ipynb but as a standalone script.
"""
import os
import csv
from datetime import date
from dotenv import load_dotenv
from pathlib import Path
from supabase import create_client, Client

env_path = Path('..') / '.env.local'
load_dotenv(dotenv_path=env_path)

url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

COMPETITION_ID = 8
LEAGUE_UNIQUE = "ncaambb"
YEAR = 2026
STATS_THRU = "2026-03-16"
EXPECTED_NUM_TEAMS = 68


def generate_rounds(rounds_csv, competition_id):
    rounds_insert = []
    with open(rounds_csv, mode='r', encoding='utf-8-sig') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            row['competition_id'] = competition_id
            rounds_insert.append(row)
    return rounds_insert


def add_rounds_to_db(rounds_csv, competition_id):
    rounds = generate_rounds(rounds_csv, competition_id)
    result = supabase.table("competitionround").upsert(
        rounds, ignore_duplicates=True, on_conflict="round_num, competition_id"
    ).execute()
    print(f"Rounds: {len(rounds)} loaded")
    return result


def generate_teams(team_stats_csv, team_seeds_csv, league_unique, competition_id, expected_num_teams, thru):
    team_insert = []
    team_competition_insert = []
    team_seed_dict = {}

    with open(team_seeds_csv, mode='r', encoding='utf-8-sig') as csv_file:
        seeds_csv_reader = csv.DictReader(csv_file)
        for row in seeds_csv_reader:
            team_seed_row = {key: row[key].lower() if key == 'team_unique' else row[key]
                            for key in row.keys() & {'team_unique', 'seed', 'overall_seed', 'region', 'round_started'}}
            team_seed_row['competition_id'] = competition_id
            team_seed_row['league_unique'] = league_unique
            team_seed_dict[team_seed_row['team_unique']] = team_seed_row

    if len(team_seed_dict) != expected_num_teams:
        raise ValueError(f"Seed file has {len(team_seed_dict)} teams, expected {expected_num_teams}")

    with open(team_stats_csv, mode='r', encoding='utf-8-sig') as csv_file:
        stats_csv_reader = csv.DictReader(csv_file)
        for row in stats_csv_reader:
            team_unique = row['abbreviation'].lower()
            if team_unique.endswith("/women"):
                team_unique = team_unique[:-6]
            if team_unique.endswith("/men"):
                team_unique = team_unique[:-4]

            if team_unique not in team_seed_dict:
                continue

            team_row = {'league_unique': league_unique,
                        'team_unique': team_unique,
                        'team_name': row['name']}
            team_insert.append(team_row)

            team_seed_dict[team_unique]['team_stats'] = {
                key: float(row[key]) if row[key] else 0
                for key in row.keys() & {
                    'effective_field_goal_percentage', 'strength_of_schedule',
                    'assist_percentage', 'free_throw_attempt_rate', 'offensive_rating',
                    'opp_effective_field_goal_percentage', 'two_point_field_goal_percentage',
                    'three_point_field_goal_percentage', 'pace', 'three_point_attempt_rate',
                    'true_shooting_percentage', 'turnover_percentage'
                }
            }
            team_seed_dict[team_unique]['team_win_loss'] = {
                key: float(row[key]) if row[key] else 0
                for key in row.keys() & {'games_played', 'wins', 'losses', 'conference_wins', 'conference_losses'}
            }
            team_seed_dict[team_unique]['team_stats']['conference'] = row['conference'].lower()
            team_seed_dict[team_unique]['stats_thru'] = thru
            team_competition_insert.append(team_seed_dict[team_unique])

    if len(team_insert) != expected_num_teams or len(team_competition_insert) != expected_num_teams:
        raise ValueError(
            f"After stats processing: {len(team_insert)} teams / {len(team_competition_insert)} team_competition, "
            f"expected {expected_num_teams}"
        )
    return [team_insert, team_competition_insert]


def add_teams_to_db(team_stats_csv, team_seeds_csv, league_unique, competition_id, expected_num_teams, thru):
    [teams, team_competition] = generate_teams(
        team_stats_csv, team_seeds_csv, league_unique, competition_id, expected_num_teams, thru
    )
    supabase.table("team").upsert(
        teams, ignore_duplicates=True, on_conflict="team_unique, league_unique"
    ).execute()
    supabase.table("team_competition").upsert(
        team_competition, ignore_duplicates=False, on_conflict="team_unique, competition_id, league_unique"
    ).execute()
    print(f"Teams: {len(teams)} loaded, {len(team_competition)} team_competition records")


def generate_players(player_stats_csv, competition_id, league_unique, thru):
    player_insert = []
    player_competition_insert = []

    with open(player_stats_csv, mode='r', encoding='utf-8-sig') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            player_unique = row['player_id'].lower()
            team_unique = row['team_abbreviation'].lower()

            player_row = {
                'player_unique': player_unique,
                'player_name': row['name'],
                'position': row.get('position') or None,
            }

            stat_keys = {
                'points', 'assists', 'blocks', 'minutes_played',
                'effective_field_goal_percentage', 'field_goals', 'field_goal_attempts',
                'field_goal_percentage', 'two_pointers', 'two_point_attempts',
                'two_point_percentage', 'three_pointers', 'three_point_attempts',
                'three_point_percentage', 'free_throws', 'free_throw_attempts',
                'free_throw_percentage', 'free_throw_attempt_rate', 'offensive_rebounds',
                'defensive_rebounds', 'steals', 'turnovers', 'personal_fouls',
                'usage_percentage', 'true_shooting_percentage', 'player_efficiency_rating',
                'games_played', 'games_started'
            }
            player_stats = {
                key: float(row[key]) if row.get(key) and row[key] != '' else 0
                for key in row.keys() & stat_keys
            }
            player_stats['rebounds'] = int(float(row['total_rebounds'])) if row.get('total_rebounds') and row['total_rebounds'] != '' else 0

            player_competition_row = {
                'player_unique': player_unique,
                'competition_id': competition_id,
                'league_unique': league_unique,
                'team_unique': team_unique,
                'inactive': False,
                'stats_thru': thru,
                'player_stats': player_stats
            }

            player_insert.append(player_row)
            player_competition_insert.append(player_competition_row)

    return [player_insert, player_competition_insert]


def add_players_to_db(player_stats_csv, competition_id, league_unique, thru):
    [players, player_competition] = generate_players(player_stats_csv, competition_id, league_unique, thru)
    supabase.table("player").upsert(
        players, ignore_duplicates=True, on_conflict="player_unique"
    ).execute()
    supabase.table("player_competition").upsert(
        player_competition, ignore_duplicates=False, on_conflict='player_unique,competition_id'
    ).execute()
    print(f"Players: {len(players)} loaded, {len(player_competition)} player_competition records")


def main():
    print(f"Loading 2026 tournament data (competition_id={COMPETITION_ID})")
    print()

    print("Step 1: Rounds")
    add_rounds_to_db(f"{YEAR}/rounds-{YEAR}-ncaa-tournament.csv", COMPETITION_ID)

    print("\nStep 2: Teams")
    add_teams_to_db(
        team_stats_csv=f"{YEAR}/{YEAR}_ncaa_tournament_team_stats.csv",
        team_seeds_csv=f"{YEAR}/{YEAR}_ncaa_tournament_team_seeds.csv",
        league_unique=LEAGUE_UNIQUE,
        competition_id=COMPETITION_ID,
        expected_num_teams=EXPECTED_NUM_TEAMS,
        thru=STATS_THRU
    )

    print("\nStep 3: Players")
    add_players_to_db(
        player_stats_csv=f"{YEAR}/{YEAR}_ncaa_tournament_player_stats.csv",
        competition_id=COMPETITION_ID,
        league_unique=LEAGUE_UNIQUE,
        thru=STATS_THRU
    )

    print("\nDone!")


if __name__ == "__main__":
    main()
