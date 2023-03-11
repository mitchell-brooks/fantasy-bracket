import { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@lib/database.types';

export type WithSupabaseClient<T> = T & { supabase: SupabaseClient };
export type PoolRule_DraftRow =
  Database['public']['Tables']['poolrule_draft']['Row'];
export type PoolRule_PrizeSplitRow =
  Database['public']['Tables']['poolrule_prizesplit']['Row'];
export type User_PoolRow = Database['public']['Tables']['user_pool']['Row'];
export type PoolRow = Database['public']['Tables']['pool']['Row'];
export type PoolMetaRow = Database['public']['Tables']['poolmeta']['Row'];
