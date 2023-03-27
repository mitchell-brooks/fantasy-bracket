import { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@lib/database.types';

export type WithSupabaseClient<T> = T & { supabase: SupabaseClient };
export type PoolRule_DraftRow =
  Database['public']['Tables']['poolrule_draft']['Row'];
export type PoolRule_PrizeSplitRow =
  Database['public']['Tables']['poolrule_prizesplit']['Row'];
export type PoolRow = Database['public']['Tables']['pool']['Row'];
export type PoolMetaRow = Database['public']['Tables']['poolmeta']['Row'];
export type Player_CompetitionRow =
  Database['public']['Tables']['player_competition']['Row'];
export type Team_CompetitionRow =
  Database['public']['Tables']['team_competition']['Row'];
export type PlayerRow = Database['public']['Tables']['player']['Row'];
export type TeamRow = Database['public']['Tables']['team']['Row'];
export type RosterRankingRow =
  Database['public']['Tables']['rosterranking']['Row'];
export type RosterRow = Database['public']['Tables']['roster']['Row'];
export type RankingFullViewRow =
  Database['public']['Views']['ranking_full_view']['Row'];
export type ViewPoolPlayersFullRow =
  Database['public']['Views']['view_pool_players_full']['Row'];

export type DraftViewRow = Database['public']['Views']['draft_view']['Row'];
export type PoolFullViewRow =
  Database['public']['Views']['pool_full_view']['Row'];

export type SingleOrArray<T> = T extends Array<infer U> ? U[] : T;
export type RowCreateBase<T, K, V = K extends keyof T ? Omit<T, K> : T> = (
  supabase: SupabaseClient,
  rowData: SingleOrArray<V>
) => Promise<SingleOrArray<T>>;

export type RowCreate<T, K = void> = RowCreateBase<T, K>;
