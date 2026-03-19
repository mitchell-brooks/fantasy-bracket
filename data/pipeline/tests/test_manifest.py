# ABOUTME: Tests for the run manifest and logging module
# ABOUTME: Verifies manifest creation, failure tracking, and retry command generation
import json
from pipeline.manifest import RunManifest


def test_manifest_tracks_team_success(tmp_path):
    manifest = RunManifest(
        config_path="seasons/2026.toml",
        expected_teams=68,
        output_dir=str(tmp_path),
    )
    manifest.record_team_success("DUKE", 12)
    assert manifest.teams_succeeded == 1
    assert manifest.players_total == 12


def test_manifest_tracks_team_failure(tmp_path):
    manifest = RunManifest(
        config_path="seasons/2026.toml",
        expected_teams=68,
        output_dir=str(tmp_path),
    )
    manifest.record_team_failure("VILLANOVA")
    assert manifest.teams_failed == ["VILLANOVA"]


def test_manifest_tracks_player_failure(tmp_path):
    manifest = RunManifest(
        config_path="seasons/2026.toml",
        expected_teams=68,
        output_dir=str(tmp_path),
    )
    manifest.record_player_failure("milos-uzan-1")
    assert manifest.players_failed == ["milos-uzan-1"]


def test_manifest_generates_retry_commands(tmp_path):
    manifest = RunManifest(
        config_path="seasons/2026.toml",
        expected_teams=68,
        output_dir=str(tmp_path),
    )
    manifest.record_team_failure("VILLANOVA")
    manifest.record_player_failure("milos-uzan-1")
    commands = manifest.retry_commands()
    assert any("--retry-teams VILLANOVA" in cmd for cmd in commands)
    assert any("--retry-players milos-uzan-1" in cmd for cmd in commands)


def test_manifest_saves_to_file(tmp_path):
    manifest = RunManifest(
        config_path="seasons/2026.toml",
        expected_teams=68,
        output_dir=str(tmp_path),
    )
    manifest.record_team_success("DUKE", 12)
    manifest.save()
    manifest_path = tmp_path / "manifest.json"
    assert manifest_path.exists()
    data = json.loads(manifest_path.read_text())
    assert data["teams_succeeded"] == 1
    assert data["players_total"] == 12


def test_manifest_no_retry_commands_when_no_failures(tmp_path):
    manifest = RunManifest(
        config_path="seasons/2026.toml",
        expected_teams=68,
        output_dir=str(tmp_path),
    )
    manifest.record_team_success("DUKE", 12)
    assert manifest.retry_commands() == []
