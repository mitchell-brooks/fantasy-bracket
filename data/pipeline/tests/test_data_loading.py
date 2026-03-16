# ABOUTME: Tests for CSV data loading and transformation functions
# ABOUTME: Validates parsing of rounds, teams, players, and conferences CSVs
import pytest
from pipeline.data_loading import (
    generate_rounds,
    generate_conferences,
    generate_teams,
    generate_players,
    _validate_csv,
)


# --- _validate_csv ---


def test_validate_csv_with_valid_file(tmp_path):
    """_validate_csv returns the path when all required columns are present."""
    csv_file = tmp_path / "valid.csv"
    csv_file.write_text("col_a,col_b,col_c\n1,2,3\n")
    result = _validate_csv(str(csv_file), {"col_a", "col_b"})
    assert result == str(csv_file)


def test_validate_csv_missing_columns_raises(tmp_path):
    """_validate_csv raises ValueError when required columns are absent."""
    csv_file = tmp_path / "bad.csv"
    csv_file.write_text("col_a,col_c\n1,2\n")
    with pytest.raises(ValueError, match="missing_col"):
        _validate_csv(str(csv_file), {"col_a", "missing_col"})


def test_validate_csv_missing_file_raises():
    """_validate_csv raises FileNotFoundError for nonexistent path."""
    with pytest.raises(FileNotFoundError):
        _validate_csv("/nonexistent/file.csv", {"col_a"})


# --- generate_rounds ---


def test_generate_rounds_parses_csv(tmp_path):
    """generate_rounds reads CSV rows and attaches competition_id."""
    csv_file = tmp_path / "rounds.csv"
    csv_file.write_text(
        "round_num,round_name,round_start,round_end\n"
        "1,First Four,2025-03-18,2025-03-19\n"
        "2,Round of 64,2025-03-20,2025-03-21\n"
    )
    result = generate_rounds(str(csv_file), competition_id=6)
    assert len(result) == 2
    assert result[0]["round_num"] == "1"
    assert result[0]["round_name"] == "First Four"
    assert result[0]["competition_id"] == 6
    assert result[1]["round_num"] == "2"
    assert result[1]["competition_id"] == 6


def test_generate_rounds_empty_csv(tmp_path):
    """generate_rounds with headers only returns empty list."""
    csv_file = tmp_path / "rounds.csv"
    csv_file.write_text("round_num,round_name,round_start,round_end\n")
    result = generate_rounds(str(csv_file), competition_id=6)
    assert result == []


def test_generate_rounds_missing_file():
    """generate_rounds raises FileNotFoundError for missing file."""
    with pytest.raises(FileNotFoundError):
        generate_rounds("/nonexistent/rounds.csv", competition_id=6)


def test_generate_rounds_missing_columns(tmp_path):
    """generate_rounds raises ValueError when required columns are missing."""
    csv_file = tmp_path / "rounds.csv"
    csv_file.write_text("round_num,wrong_column\n1,foo\n")
    with pytest.raises(ValueError):
        generate_rounds(str(csv_file), competition_id=6)


# --- generate_conferences ---


def test_generate_conferences(tmp_path):
    """generate_conferences parses CSV and lowercases conference_unique."""
    csv_file = tmp_path / "conferences.csv"
    csv_file.write_text(
        "conference_unique,conference_name,From,To,W,L\n"
        "AAC,American Athletic Conference,2014,2023,1996,1527\n"
        "ACC,Atlantic Coast Conference,1954,2023,2000,1500\n"
    )
    result = generate_conferences(str(csv_file), league_unique="ncaambb")
    assert len(result) == 2
    assert result[0]["conference_unique"] == "aac"
    assert result[0]["conference_name"] == "American Athletic Conference"
    assert result[0]["league_unique"] == "ncaambb"
    # Only keep conference_unique, conference_name, league_unique
    assert "From" not in result[0]
    assert "W" not in result[0]


def test_generate_conferences_lowercases_league(tmp_path):
    """generate_conferences lowercases the league_unique parameter."""
    csv_file = tmp_path / "conferences.csv"
    csv_file.write_text(
        "conference_unique,conference_name\n"
        "SEC,Southeastern Conference\n"
    )
    result = generate_conferences(str(csv_file), league_unique="NCAAMBB")
    assert result[0]["league_unique"] == "ncaambb"


# --- generate_teams ---


def _write_team_seeds(tmp_path, filename="seeds.csv"):
    csv_file = tmp_path / filename
    csv_file.write_text(
        "team_unique,overall_seed,seed,region,round_started\n"
        "auburn,1,1,SOUTH,2\n"
        "duke,2,1,EAST,2\n"
    )
    return str(csv_file)


def _write_team_stats(tmp_path, filename="stats.csv"):
    csv_file = tmp_path / filename
    csv_file.write_text(
        ",abbreviation,name,conference,games_played,wins,losses,"
        "conference_wins,conference_losses,"
        "effective_field_goal_percentage,strength_of_schedule,"
        "assist_percentage,free_throw_attempt_rate,offensive_rating,"
        "opp_effective_field_goal_percentage,two_point_field_goal_percentage,"
        "three_point_field_goal_percentage,pace,three_point_attempt_rate,"
        "true_shooting_percentage,turnover_percentage\n"
        "0,auburn,Auburn,sec,34,28,6,15,3,"
        "0.557,-4.36,59.2,0.259,116.3,"
        "0.489,0.566,0.364,72.4,0.461,0.583,14.2\n"
        "1,duke,Duke,acc,35,30,5,16,2,"
        "0.560,-3.00,60.0,0.270,118.0,"
        "0.480,0.570,0.370,73.0,0.470,0.590,13.5\n"
    )
    return str(csv_file)


def test_generate_teams_returns_two_lists(tmp_path):
    """generate_teams returns [team_inserts, team_competition_inserts]."""
    seeds_csv = _write_team_seeds(tmp_path)
    stats_csv = _write_team_stats(tmp_path)
    result = generate_teams(
        stats_csv, seeds_csv,
        league_unique="ncaambb", competition_id=6,
        expected_num_teams=2,
    )
    team_inserts, team_competition_inserts = result
    assert len(team_inserts) == 2
    assert len(team_competition_inserts) == 2


def test_generate_teams_team_insert_shape(tmp_path):
    """Team inserts have league_unique, team_unique, and team_name."""
    seeds_csv = _write_team_seeds(tmp_path)
    stats_csv = _write_team_stats(tmp_path)
    team_inserts, _ = generate_teams(
        stats_csv, seeds_csv,
        league_unique="ncaambb", competition_id=6,
        expected_num_teams=2,
    )
    team = team_inserts[0]
    assert "team_unique" in team
    assert "team_name" in team
    assert "league_unique" in team
    assert team["team_unique"] == "auburn"
    assert team["team_name"] == "Auburn"
    assert team["league_unique"] == "ncaambb"


def test_generate_teams_competition_insert_shape(tmp_path):
    """Team competition inserts have seed, region, stats, and win/loss."""
    seeds_csv = _write_team_seeds(tmp_path)
    stats_csv = _write_team_stats(tmp_path)
    _, tc_inserts = generate_teams(
        stats_csv, seeds_csv,
        league_unique="ncaambb", competition_id=6,
        expected_num_teams=2,
    )
    tc = tc_inserts[0]
    assert tc["competition_id"] == 6
    assert tc["seed"] == "1"
    assert tc["region"] == "SOUTH"
    assert "team_stats" in tc
    assert "team_win_loss" in tc
    assert isinstance(tc["team_stats"], dict)
    assert isinstance(tc["team_win_loss"], dict)


def test_generate_teams_wrong_count_raises(tmp_path):
    """generate_teams raises ValueError when seed count != expected_num_teams."""
    seeds_csv = _write_team_seeds(tmp_path)
    stats_csv = _write_team_stats(tmp_path)
    with pytest.raises(ValueError, match="does not match"):
        generate_teams(
            stats_csv, seeds_csv,
            league_unique="ncaambb", competition_id=6,
            expected_num_teams=99,
        )


# --- generate_players ---


def _write_player_stats(tmp_path, filename="players.csv"):
    csv_file = tmp_path / filename
    csv_file.write_text(
        ",player_id,name,team_abbreviation,position,points,assists,blocks,"
        "minutes_played,effective_field_goal_percentage,field_goals,"
        "field_goal_attempts,field_goal_percentage,"
        "two_pointers,two_point_attempts,two_point_percentage,"
        "three_pointers,three_point_attempts,three_point_percentage,"
        "free_throws,free_throw_attempts,free_throw_percentage,"
        "free_throw_attempt_rate,offensive_rebounds,defensive_rebounds,"
        "total_rebounds,steals,turnovers,personal_fouls,"
        "usage_percentage,true_shooting_percentage,player_efficiency_rating,"
        "games_played,games_started\n"
        "0,johad-williams-1,Johad Williams,AUBURN,Guard,476,118,18,"
        "1020,0.496,168,376,0.447,"
        "131,255,0.514,"
        "37,121,0.306,"
        "103,130,0.792,"
        "0.346,35,136,171,60,62,72,"
        "23.3,0.544,19.5,34,33\n"
    )
    return str(csv_file)


def test_generate_players_returns_three_lists(tmp_path):
    """generate_players returns [player_inserts, player_competition_inserts, player_stat_inserts]."""
    csv_file = _write_player_stats(tmp_path)
    result = generate_players(csv_file, competition_id=6, league_unique="ncaambb")
    assert len(result) == 3
    player_inserts, pc_inserts, stat_inserts = result
    assert len(player_inserts) == 1
    assert len(pc_inserts) == 1
    assert len(stat_inserts) == 1


def test_generate_players_player_insert_shape(tmp_path):
    """Player inserts have player_unique, player_name, and position."""
    csv_file = _write_player_stats(tmp_path)
    player_inserts, _, _ = generate_players(
        csv_file, competition_id=6, league_unique="ncaambb"
    )
    player = player_inserts[0]
    assert player["player_unique"] == "johad-williams-1"
    assert player["player_name"] == "Johad Williams"
    assert player["position"] == "Guard"


def test_generate_players_competition_insert_shape(tmp_path):
    """Player competition inserts link player to team and competition."""
    csv_file = _write_player_stats(tmp_path)
    _, pc_inserts, _ = generate_players(
        csv_file, competition_id=6, league_unique="ncaambb"
    )
    pc = pc_inserts[0]
    assert pc["player_unique"] == "johad-williams-1"
    assert pc["competition_id"] == 6
    assert pc["league_unique"] == "ncaambb"
    assert pc["team_unique"] == "auburn"
    assert pc["inactive"] is False
    assert "player_stats" in pc
    assert isinstance(pc["player_stats"], dict)


def test_generate_players_stat_insert_has_numeric_values(tmp_path):
    """Player stats contain numeric values parsed from CSV."""
    csv_file = _write_player_stats(tmp_path)
    _, _, stat_inserts = generate_players(
        csv_file, competition_id=6, league_unique="ncaambb"
    )
    stats = stat_inserts[0]
    assert stats["points"] == 476.0
    assert stats["assists"] == 118.0
    assert stats["rebounds"] == 171
    assert stats["games_played"] == 34.0


def test_generate_players_missing_file():
    """generate_players raises FileNotFoundError for missing file."""
    with pytest.raises(FileNotFoundError):
        generate_players("/nonexistent/players.csv", competition_id=6, league_unique="ncaambb")
