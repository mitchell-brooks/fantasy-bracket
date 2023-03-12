import { PoolMetaRow } from '@lib/api/types';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs';

// type RowCreate<T> = (supabase: SupabaseClient, rowData: T | T[]) => T extends Omit ? Promise<T>;
type SingleOrArray<T> = T extends Array<infer U> ? U[] : T;
type RowCreateBase<T, K, V = K extends keyof T ? Omit<T, K> : T> = (
  supabase: SupabaseClient,
  rowData: SingleOrArray<V>
) => Promise<SingleOrArray<T>>;

type RowCreate<T, K = void> = RowCreateBase<T, K>;

export const create: RowCreate<PoolMetaRow, 'poolmeta_id'> = async (
  supabase,
  rowData
) => {
  const { data, error } = await supabase
    .from('poolmeta')
    .insert(rowData)
    .select();
  if (error) throw Error(error.message);
  else return data as unknown as Promise<SingleOrArray<PoolMetaRow>>;
};
