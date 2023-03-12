import { PoolMetaRow, RowCreate, SingleOrArray } from '@lib/api/types';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs';

// type RowCreate<T> = (supabase: SupabaseClient, rowData: T | T[]) => T extends Omit ? Promise<T>;
export function create<T, K = void, V = K extends keyof T ? Omit<T, K> : T>(
  supabase: SupabaseClient,
  tableName: string,
  rowData: V
): Promise<T>;
export function create<T, K = void, V = K extends keyof T ? Omit<T, K>[] : T[]>(
  supabase: SupabaseClient,
  tableName: string,
  rowData: V
): Promise<T[]>;

export async function create(
  supabase: SupabaseClient,
  tableName: string,
  rowData: SingleOrArray<unknown>
) {
  const { data, error } = await supabase
    .from(tableName)
    .insert(rowData)
    .select();
  if (error) throw Error(error.message);
  else return data as unknown as Promise<SingleOrArray<unknown>>;
}
