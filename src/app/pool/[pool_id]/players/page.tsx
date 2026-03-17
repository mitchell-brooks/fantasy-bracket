// ABOUTME: Unified all-players page with collapsible filter chip groups
// ABOUTME: Shows all players (drafted and undrafted) with status, team, participant filters
import React from 'react';
import { createClient } from '@utils/supabase-server';
import { AllPlayersGrid, type PlayerRow } from './all-players-grid';
import styles from './players-page.module.css';

function extractNum(obj: unknown, key: string): number | null {
  if (obj == null || typeof obj !== 'object' || !(key in obj)) return null;
  const val = (obj as Record<string, unknown>)[key];
  return typeof val === 'number' ? val : null;
}

export default async function AllPlayersPage({
  params,
}: {
  params: Promise<{ pool_id: string }>;
}) {
  const { pool_id: pool_id_param } = await params;
  const pool_id = Number(pool_id_param);
  const supabase = await createClient();

  // All players in the pool (drafted and undrafted)
  const { data: all_players } = await supabase
    .from('view_pool_players_full')
    .select('*')
    .eq('pool_id', pool_id);

  // Drafted players with scores and usernames
  const { data: roster_data } = await supabase
    .from('roster_player_total_scores_view')
    .select('player_unique, roster_id, username, total_player_points, pick_number')
    .eq('pool_id', pool_id);

  // Build a lookup from player_unique → roster info
  const rosterLookup = new Map(
    (roster_data ?? []).map((r) => [r.player_unique, r])
  );

  const rows: PlayerRow[] = (all_players ?? []).map((player) => {
    const rosterInfo = player.player_unique ? rosterLookup.get(player.player_unique) : null;
    const isDrafted = rosterInfo != null;

    let status = 'Active';
    if (player.round_eliminated) {
      status = 'Eliminated';
    } else if (player.inactive) {
      status = 'Inactive';
    }
    if (!isDrafted) {
      status = 'Undrafted';
    }

    return {
      player_name: player.player_name,
      total_player_points: rosterInfo?.total_player_points ?? null,
      tournament_points: player.tournament_points,
      team_name: player.team_name,
      seed: player.seed,
      pick_number: rosterInfo?.pick_number ?? null,
      username: rosterInfo?.username ?? null,
      round_eliminated: player.round_eliminated,
      roster_id: rosterInfo?.roster_id ?? null,
      region: player.region,
      pool_id,
      status,
      drafted: isDrafted,
      position: player.position,
      regular_season_points: extractNum(player.player_stats, 'points'),
      assists: extractNum(player.player_stats, 'assists'),
      rebounds: extractNum(player.player_stats, 'rebounds'),
      wins: extractNum(player.team_win_loss, 'wins'),
      losses: extractNum(player.team_win_loss, 'losses'),
      overall_seed: player.overall_seed,
    };
  });

  const participants = Array.from(new Set(
    rows.map((r) => r.username).filter((u): u is string => u != null)
  )).sort();

  const teams = Array.from(new Set(
    rows.map((r) => r.team_name).filter((t): t is string => t != null)
  )).sort();

  const regions = Array.from(new Set(
    rows.map((r) => r.region).filter((r): r is string => r != null)
  )).sort();

  const statuses = Array.from(new Set(rows.map((r) => r.status))).sort();
  const draftStatuses = ['Drafted', 'Undrafted'];

  const filterGroups = [
    {
      label: 'Status',
      column: 'status',
      chips: statuses,
      colorStyle: 'positive' as const,
    },
    {
      label: 'Draft',
      column: 'drafted',
      chips: draftStatuses,
    },
    {
      label: 'Participant',
      column: 'username',
      chips: participants,
    },
    {
      label: 'Team',
      column: 'team_name',
      chips: teams,
    },
    ...(regions.length > 1 ? [{
      label: 'Region',
      column: 'region',
      chips: regions,
    }] : []),
  ];

  return (
    <div className={styles.page}>
      <h1>All Players</h1>
      <AllPlayersGrid rows={rows} filterGroups={filterGroups} />
    </div>
  );
}
