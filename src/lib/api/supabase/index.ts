import { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@lib/database.types';

export async function create<
  T,
  K = void,
  V = T extends Array<infer U>
    ? K extends keyof U
      ? Omit<U, K>[]
      : U[]
    : K extends keyof T
    ? Omit<T, K>
    : T
>(
  supabase: SupabaseClient,
  tableName: keyof Database['public']['Tables'],
  rowData: V
) {
  console.log(':::create', tableName);
  const { data, error } = await supabase
    .from(tableName)
    .insert(rowData)
    .select();
  if (error) throw Error(error.message);
  else return data as unknown as Promise<T[]>;
}

export async function get<T>(
  supabase: SupabaseClient,
  tableName: keyof Database['public']['Tables'],
  columns?: T
) {
  console.log(':::get', tableName);
  const { data, error } = await supabase.from(tableName).select().eq(rowData);
  if (error) throw Error(error.message);
  else return data as unknown as Promise<T[]>;
}
