# ABOUTME: Draft execution logic for fantasy bracket pools
# ABOUTME: Handles player selection, snake ordering, rankings, and full draft runs
from __future__ import annotations

import random
from typing import Optional

from supabase import Client


def select_next_pick(
    rankings: list[str], drafted: set[str], active: set[str]
) -> Optional[str]:
    """Pick the highest-ranked player that is undrafted and still active.

    Args:
        rankings: Ordered list of player IDs from most to least preferred.
        drafted: Set of player IDs already picked by any roster.
        active: Set of player IDs still alive in the tournament.

    Returns:
        The player_unique of the best available pick, or None if none available.
    """
    for player in rankings:
        if player not in drafted and player in active:
            return player
    return None


def apply_snake_order(rosters: list[str], round_num: int) -> list[str]:
    """Apply snake draft ordering: reverse on even rounds.

    Args:
        rosters: Base draft order (list of roster IDs).
        round_num: 1-indexed round number.

    Returns:
        New list with order reversed on even rounds, original on odd.
    """
    if round_num % 2 == 0:
        return list(reversed(rosters))
    return list(rosters)


def generate_autodraft_rankings(
    pool_id: int, draft_num: int, strategy: str, supabase: Client
) -> list[str]:
    """Generate player rankings for auto-drafting.

    Args:
        pool_id: The pool to generate rankings for.
        draft_num: Which draft within the pool.
        strategy: "RANDOM" or "TOURNAMENT_POINTS".
        supabase: Authenticated Supabase client.

    Returns:
        Ordered list of player_unique strings.
    """
    if strategy == "TOURNAMENT_POINTS":
        competition_id = (
            supabase.table("pool")
            .select("competition_id")
            .eq("pool_id", pool_id)
            .execute()
            .data[0]["competition_id"]
        )
        ranked_players = (
            supabase.table("player_total_score_view")
            .select("player_unique, total_points")
            .eq("competition_id", competition_id)
            .order("total_points", desc=True, nullsfirst=False)
            .execute()
            .data
        )
        available_set = {
            row["player_unique"]
            for row in supabase.table("view_available_players")
            .select("player_unique")
            .eq("pool_id", pool_id)
            .execute()
            .data
        }
        return [
            row["player_unique"]
            for row in ranked_players
            if row["player_unique"] in available_set
        ]

    # Default: RANDOM
    available_players = [
        row["player_unique"]
        for row in supabase.table("view_available_players")
        .select("player_unique")
        .eq("pool_id", pool_id)
        .execute()
        .data
    ]
    random.shuffle(available_players)
    return available_players


def generate_rankings_dict(
    pool_id: int,
    draft_num: int,
    supabase: Client,
    autodraft_strategy: str = "RANDOM",
    max_players: int = 1000,
) -> dict[str, list[str]]:
    """Build per-roster ranking lists, filling gaps with autodraft.

    User-submitted rankings are loaded from the draft_view. Rosters without
    submissions get a full autodraft list. Rosters with partial submissions
    get their user rankings extended with autodraft picks, excluding any
    players already in their list.

    Args:
        pool_id: The pool ID.
        draft_num: Which draft within the pool.
        supabase: Authenticated Supabase client.
        autodraft_strategy: "RANDOM" or "TOURNAMENT_POINTS".
        max_players: Upper bound for ranking slots (sparse array size).

    Returns:
        Dict mapping roster_id (str) to ordered list of player_unique strings.
    """
    rankings_data = (
        supabase.table("draft_view")
        .select("ranking, roster_id, player_unique")
        .eq("pool_id", pool_id)
        .eq("draft_num", draft_num)
        .execute()
    )

    # Build sparse arrays from user-submitted rankings
    sparse_map: dict[str, list[Optional[str]]] = {}
    for row in rankings_data.data:
        roster_id = str(row["roster_id"])
        ranking = int(row["ranking"])
        player_unique = row["player_unique"]
        if roster_id not in sparse_map:
            sparse_map[roster_id] = [None] * max_players
        sparse_map[roster_id][ranking] = player_unique

    # Compact sparse arrays into dense lists
    cleaned_map: dict[str, list[str]] = {}
    for roster_id, sparse_list in sparse_map.items():
        cleaned_map[roster_id] = [p for p in sparse_list if p is not None]

    # Get draft order to find rosters that need autodraft
    draft_order = get_draft_order(pool_id, draft_num, supabase)
    autodraft = generate_autodraft_rankings(
        pool_id, draft_num, autodraft_strategy, supabase
    )

    for roster_id_int in draft_order:
        roster_key = str(roster_id_int)
        if roster_key not in cleaned_map:
            # No user rankings at all — use full autodraft
            cleaned_map[roster_key] = list(autodraft)
        else:
            # Extend user rankings with autodraft picks not already present
            existing = set(cleaned_map[roster_key])
            extras = [p for p in autodraft if p not in existing]
            cleaned_map[roster_key].extend(extras)

    return cleaned_map


def get_active_players(competition_id: int, supabase: Client) -> set[str]:
    """Fetch players still alive in the tournament.

    Args:
        competition_id: The competition to check.
        supabase: Authenticated Supabase client.

    Returns:
        Set of player_unique strings for active (non-eliminated) players.
    """
    rows = (
        supabase.table("view_active_players")
        .select("player_unique, round_eliminated")
        .eq("competition_id", competition_id)
        .execute()
        .data
    )
    return {
        row["player_unique"] for row in rows if row["round_eliminated"] is None
    }


def get_draft_order(
    pool_id: int,
    draft_num: int,
    supabase: Client,
    num_participants: Optional[int] = None,
) -> list[int]:
    """Retrieve or generate the draft order for a pool.

    Args:
        pool_id: The pool ID.
        draft_num: Which draft within the pool.
        supabase: Authenticated Supabase client.
        num_participants: Expected number of participants (used to validate).

    Returns:
        Ordered list of roster_id integers.
    """
    draft_order_data = (
        supabase.table("draft_order_view")
        .select("*")
        .eq("pool_id", pool_id)
        .eq("draft_num", draft_num)
        .execute()
        .data
    )

    if draft_order_data and (
        num_participants is None or len(draft_order_data) == num_participants
    ):
        # Build ordered list from draft_order column
        slots: list[Optional[int]] = [None] * (len(draft_order_data) + 1)
        for row in draft_order_data:
            slots[row["draft_order"]] = row["roster_id"]
        return [r for r in slots if r is not None]

    return generate_draft_order(pool_id, draft_num, supabase)


def generate_draft_order(
    pool_id: int, draft_num: int, supabase: Client
) -> list[int]:
    """Generate a new random draft order and store it in the database.

    Args:
        pool_id: The pool ID.
        draft_num: Which draft within the pool.
        supabase: Authenticated Supabase client.

    Returns:
        Ordered list of roster_id integers.
    """
    rosters = (
        supabase.table("roster")
        .select("roster_id")
        .eq("pool_id", pool_id)
        .execute()
        .data
    )
    roster_ids = [row["roster_id"] for row in rosters]
    random.shuffle(roster_ids)

    order_rows = [
        {
            "pool_id": pool_id,
            "draft_num": draft_num,
            "roster_id": rid,
            "draft_order": idx + 1,
        }
        for idx, rid in enumerate(roster_ids)
    ]
    supabase.table("draft_order").insert(order_rows).execute()

    return roster_ids


def run_draft(
    pool_id: int,
    draft_num: int,
    supabase: Client,
    strategy: str = "RANDOM",
) -> list[dict]:
    """Execute a full draft, returning the list of picks.

    Args:
        pool_id: The pool ID.
        draft_num: Which draft within the pool.
        supabase: Authenticated Supabase client.
        strategy: Autodraft strategy ("RANDOM" or "TOURNAMENT_POINTS").

    Returns:
        List of pick dicts ready for database insertion.
    """
    draft_rules = (
        supabase.table("poolrule_draft")
        .select("*")
        .eq("pool_id", pool_id)
        .eq("draft_num", draft_num)
        .execute()
        .data[0]
    )
    roster_count = draft_rules["roster_count"]

    competition_id = (
        supabase.table("pool")
        .select("competition_id")
        .eq("pool_id", pool_id)
        .execute()
        .data[0]["competition_id"]
    )

    draft_order = get_draft_order(pool_id, draft_num, supabase)
    num_participants = len(draft_order)
    rankings_dict = generate_rankings_dict(
        pool_id, draft_num, supabase, autodraft_strategy=strategy
    )
    active_players = get_active_players(competition_id, supabase)

    drafted: set[str] = set()
    pick_num = 1
    draft_picks: list[dict] = []

    for round_num in range(1, roster_count + 1):
        round_order = apply_snake_order(
            [str(r) for r in draft_order], round_num
        )
        for roster_key in round_order:
            roster_rankings = rankings_dict.get(roster_key, [])
            player = select_next_pick(roster_rankings, drafted, active_players)
            if player is not None:
                drafted.add(player)
                draft_picks.append(
                    {
                        "pool_id": pool_id,
                        "draft_num": draft_num,
                        "roster_id": int(roster_key),
                        "player_unique": player,
                        "pick_num": pick_num,
                        "draft_round": round_num,
                    }
                )
            pick_num += 1

    return draft_picks


def drop_inactive_players(
    draft_num: int, pool_id: int, supabase: Client
) -> list[dict]:
    """Remove eliminated players from rosters.

    Args:
        draft_num: Which draft within the pool.
        pool_id: The pool ID.
        supabase: Authenticated Supabase client.

    Returns:
        List of dropped player records.
    """
    competition_id = (
        supabase.table("pool")
        .select("competition_id")
        .eq("pool_id", pool_id)
        .execute()
        .data[0]["competition_id"]
    )
    active = get_active_players(competition_id, supabase)

    rostered = (
        supabase.table("draft_pick")
        .select("draft_pick_id, player_unique, roster_id")
        .eq("pool_id", pool_id)
        .eq("draft_num", draft_num)
        .execute()
        .data
    )

    drops = [row for row in rostered if row["player_unique"] not in active]

    for drop in drops:
        supabase.table("draft_pick").delete().eq(
            "draft_pick_id", drop["draft_pick_id"]
        ).execute()

    return drops


def maintain_rosters(
    draft_num: int,
    pool_id: int,
    supabase: Client,
    strategy: str = "RANDOM",
) -> dict:
    """Drop eliminated players and fill vacancies.

    Orchestrates the roster maintenance cycle: drop inactive players,
    then run a fill draft to replace them.

    Args:
        draft_num: Which draft within the pool.
        pool_id: The pool ID.
        supabase: Authenticated Supabase client.
        strategy: Autodraft strategy for filling vacancies.

    Returns:
        Dict with 'dropped' and 'filled' lists.
    """
    dropped = drop_inactive_players(draft_num, pool_id, supabase)
    filled = run_draft(pool_id, draft_num, supabase, strategy=strategy)

    if filled:
        supabase.table("draft_pick").insert(filled).execute()

    return {"dropped": dropped, "filled": filled}
