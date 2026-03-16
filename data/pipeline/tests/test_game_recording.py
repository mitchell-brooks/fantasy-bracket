# ABOUTME: Tests for game recording CSV parsing functions
# ABOUTME: Validates scoring CSV parsing, inactive player detection, and losing team detection
import pytest
from pipeline.game_recording import parse_game_scoring_csv, ScoringResult


def _write_scoring_csv(tmp_path, filename, rows):
    """Write a scoring CSV file with the standard column headers."""
    path = tmp_path / filename
    header = "game_time,team_unique,lost,player_unique,points,inactive,game_id\n"
    lines = [header] + [row + "\n" for row in rows]
    path.write_text("".join(lines))
    return str(path)


def test_parse_scoring_csv_returns_scoring_result(tmp_path):
    """parse_game_scoring_csv returns a ScoringResult dataclass."""
    csv_path = _write_scoring_csv(tmp_path, "scores.csv", [
        "12:00,team-a,,player-1,10,,100",
    ])
    result = parse_game_scoring_csv(csv_path)
    assert isinstance(result, ScoringResult)


def test_parse_scoring_csv_extracts_player_games(tmp_path):
    """Player games are extracted with correct fields and int points."""
    csv_path = _write_scoring_csv(tmp_path, "scores.csv", [
        "12:00,team-a,,player-1,10,,100",
        "12:00,team-a,,player-2,25,,100",
        "12:00,team-b,,player-3,8,,100",
    ])
    result = parse_game_scoring_csv(csv_path)
    assert len(result.player_games) == 3
    assert result.player_games[0] == {
        "player_unique": "player-1",
        "game_id": "100",
        "points": 10,
    }
    assert result.player_games[1]["points"] == 25
    assert result.player_games[2]["points"] == 8


def test_parse_scoring_csv_points_are_int(tmp_path):
    """Points field is converted from string to int."""
    csv_path = _write_scoring_csv(tmp_path, "scores.csv", [
        "12:00,team-a,,player-1,15,,100",
    ])
    result = parse_game_scoring_csv(csv_path)
    assert result.player_games[0]["points"] == 15
    assert isinstance(result.player_games[0]["points"], int)


def test_parse_scoring_csv_detects_losing_teams(tmp_path):
    """Teams marked with 'L' in the lost column are collected."""
    csv_path = _write_scoring_csv(tmp_path, "scores.csv", [
        "12:00,team-a,L,player-1,10,,100",
        "12:00,team-a,L,player-2,5,,100",
        "12:00,team-b,,player-3,20,,100",
    ])
    result = parse_game_scoring_csv(csv_path)
    assert "team-a" in result.losing_teams
    assert "team-b" not in result.losing_teams


def test_parse_scoring_csv_detects_losing_teams_case_insensitive(tmp_path):
    """Losing team detection is case-insensitive (l and L both work)."""
    csv_path = _write_scoring_csv(tmp_path, "scores.csv", [
        "12:00,team-a,l,player-1,10,,100",
        "12:00,team-b,L,player-2,20,,100",
    ])
    result = parse_game_scoring_csv(csv_path)
    assert "team-a" in result.losing_teams
    assert "team-b" in result.losing_teams


def test_parse_scoring_csv_detects_inactive_players(tmp_path):
    """Players marked with 'I' in the inactive column are collected."""
    csv_path = _write_scoring_csv(tmp_path, "scores.csv", [
        "12:00,team-a,,player-1,10,I,100",
        "12:00,team-a,,player-2,5,,100",
    ])
    result = parse_game_scoring_csv(csv_path)
    assert "player-1" in result.inactive_players
    assert "player-2" not in result.inactive_players


def test_parse_scoring_csv_detects_inactive_players_case_insensitive(tmp_path):
    """Inactive player detection is case-insensitive (i and I both work)."""
    csv_path = _write_scoring_csv(tmp_path, "scores.csv", [
        "12:00,team-a,,player-1,,i,100",
        "12:00,team-a,,player-2,,I,100",
    ])
    result = parse_game_scoring_csv(csv_path)
    assert "player-1" in result.inactive_players
    assert "player-2" in result.inactive_players


def test_parse_scoring_csv_skips_empty_points(tmp_path):
    """Rows with empty points field are not included in player_games."""
    csv_path = _write_scoring_csv(tmp_path, "scores.csv", [
        "12:00,team-a,,player-1,,,100",
        "12:00,team-a,,player-2,10,,100",
    ])
    result = parse_game_scoring_csv(csv_path)
    assert len(result.player_games) == 1
    assert result.player_games[0]["player_unique"] == "player-2"


def test_parse_scoring_csv_empty_lost_and_inactive_fields(tmp_path):
    """Empty lost and inactive fields do not cause errors or false detections."""
    csv_path = _write_scoring_csv(tmp_path, "scores.csv", [
        "12:00,team-a,,player-1,10,,100",
        "12:00,team-b,,player-2,20,,100",
    ])
    result = parse_game_scoring_csv(csv_path)
    assert result.losing_teams == []
    assert result.inactive_players == []


def test_parse_scoring_csv_missing_file():
    """Parsing a nonexistent file raises FileNotFoundError."""
    with pytest.raises(FileNotFoundError):
        parse_game_scoring_csv("/nonexistent/path/scores.csv")


def test_parse_scoring_csv_handles_utf8_bom(tmp_path):
    """CSV files with UTF-8 BOM are parsed correctly."""
    path = tmp_path / "bom.csv"
    content = "\ufeffgame_time,team_unique,lost,player_unique,points,inactive,game_id\n"
    content += "12:00,team-a,,player-1,10,,100\n"
    path.write_text(content, encoding="utf-8-sig")
    result = parse_game_scoring_csv(str(path))
    assert len(result.player_games) == 1
    assert result.player_games[0]["player_unique"] == "player-1"


def test_parse_scoring_csv_combined_scenario(tmp_path):
    """Full scenario with scores, losers, inactive players, and empty rows."""
    csv_path = _write_scoring_csv(tmp_path, "scores.csv", [
        "12:00,team-a,L,player-1,10,I,100",
        "12:00,team-a,L,player-2,5,,100",
        "12:00,team-b,,player-3,20,,100",
        "12:00,team-b,,player-4,,,100",
    ])
    result = parse_game_scoring_csv(csv_path)
    assert len(result.player_games) == 3
    assert result.losing_teams == ["team-a", "team-a"]
    assert result.inactive_players == ["player-1"]
