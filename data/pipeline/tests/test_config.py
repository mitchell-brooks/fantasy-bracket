# ABOUTME: Tests for season configuration loading
# ABOUTME: Verifies TOML parsing and config validation
import pytest
from pipeline.config import load_season_config, find_season_config, SeasonConfig


def test_load_valid_config(tmp_path):
    """Loading a valid TOML config returns a SeasonConfig object."""
    config_file = tmp_path / "2025.toml"
    config_file.write_text("""
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
data_dir = "data/2025"
""")
    config = load_season_config(str(config_file))
    assert isinstance(config, SeasonConfig)
    assert config.competition_id == 6
    assert config.competition_unique == "ncaambb-d1-championship"
    assert config.season == "2024-25"
    assert config.pool_id == 19
    assert config.pool_name == "March Radness 2025"
    assert config.year == 2025
    assert config.data_dir == "data/2025"
    assert config.expected_teams == 68
    assert config.round_count == 7


def test_load_missing_file():
    """Loading a nonexistent config file raises FileNotFoundError."""
    with pytest.raises(FileNotFoundError):
        load_season_config("nonexistent.toml")


def test_load_invalid_config_missing_sections(tmp_path):
    """Loading a config with missing required sections raises KeyError."""
    config_file = tmp_path / "bad.toml"
    config_file.write_text("[competition]\nid = 1\n")
    with pytest.raises((KeyError, ValueError)):
        load_season_config(str(config_file))


def test_config_is_frozen(tmp_path):
    """SeasonConfig instances are immutable."""
    config_file = tmp_path / "2025.toml"
    config_file.write_text("""
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
data_dir = "data/2025"
""")
    config = load_season_config(str(config_file))
    with pytest.raises(AttributeError):
        config.year = 2026  # type: ignore[misc]


def test_find_season_config_2025():
    """find_season_config locates the 2025 reference config."""
    path = find_season_config(2025)
    assert "2025.toml" in path
    config = load_season_config(path)
    assert config.year == 2025


def test_find_season_config_missing_year():
    """find_season_config raises FileNotFoundError for unknown year."""
    with pytest.raises(FileNotFoundError):
        find_season_config(1999)
