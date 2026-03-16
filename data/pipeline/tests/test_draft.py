# ABOUTME: Tests for draft pure functions (select_next_pick, apply_snake_order)
# ABOUTME: Validates player selection logic and snake draft ordering
from __future__ import annotations
import pytest
from pipeline.draft import select_next_pick, apply_snake_order


class TestSelectNextPick:
    """Tests for select_next_pick(rankings, drafted, active)."""

    def test_picks_highest_ranked_available_player(self):
        """Returns the first player in rankings that is undrafted and active."""
        rankings = ["alice", "bob", "charlie"]
        drafted: set[str] = set()
        active = {"alice", "bob", "charlie"}
        assert select_next_pick(rankings, drafted, active) == "alice"

    def test_skips_drafted_players(self):
        """Skips players already in the drafted set."""
        rankings = ["alice", "bob", "charlie"]
        drafted = {"alice"}
        active = {"alice", "bob", "charlie"}
        assert select_next_pick(rankings, drafted, active) == "bob"

    def test_skips_eliminated_players(self):
        """Skips players not in the active set (eliminated)."""
        rankings = ["alice", "bob", "charlie"]
        drafted: set[str] = set()
        active = {"bob", "charlie"}  # alice eliminated
        assert select_next_pick(rankings, drafted, active) == "bob"

    def test_skips_both_drafted_and_eliminated(self):
        """Skips players that are drafted or eliminated."""
        rankings = ["alice", "bob", "charlie", "diana"]
        drafted = {"bob"}
        active = {"bob", "charlie", "diana"}  # alice eliminated
        assert select_next_pick(rankings, drafted, active) == "charlie"

    def test_returns_none_when_no_available_players(self):
        """Returns None when all ranked players are drafted or eliminated."""
        rankings = ["alice", "bob"]
        drafted = {"alice"}
        active = {"alice"}  # bob eliminated
        assert select_next_pick(rankings, drafted, active) is None

    def test_returns_none_for_empty_rankings(self):
        """Returns None when rankings list is empty."""
        assert select_next_pick([], set(), {"alice"}) is None

    def test_returns_none_for_empty_active(self):
        """Returns None when no players are active."""
        rankings = ["alice", "bob"]
        assert select_next_pick(rankings, set(), set()) is None


class TestApplySnakeOrder:
    """Tests for apply_snake_order(rosters, round_num)."""

    def test_round_1_original_order(self):
        """Round 1 (odd) returns original order."""
        rosters = ["a", "b", "c"]
        result = apply_snake_order(rosters, 1)
        assert result == ["a", "b", "c"]

    def test_round_2_reversed_order(self):
        """Round 2 (even) returns reversed order."""
        rosters = ["a", "b", "c"]
        result = apply_snake_order(rosters, 2)
        assert result == ["c", "b", "a"]

    def test_round_3_original_order(self):
        """Round 3 (odd) returns original order."""
        rosters = ["a", "b", "c"]
        result = apply_snake_order(rosters, 3)
        assert result == ["a", "b", "c"]

    def test_does_not_mutate_input(self):
        """Returns a new list, does not mutate the input."""
        rosters = ["a", "b", "c"]
        result = apply_snake_order(rosters, 2)
        assert result == ["c", "b", "a"]
        assert rosters == ["a", "b", "c"]  # original unchanged

    def test_single_roster(self):
        """Single-element list is unchanged regardless of round."""
        assert apply_snake_order(["a"], 1) == ["a"]
        assert apply_snake_order(["a"], 2) == ["a"]

    def test_empty_list(self):
        """Empty list returns empty list."""
        assert apply_snake_order([], 1) == []
        assert apply_snake_order([], 2) == []
