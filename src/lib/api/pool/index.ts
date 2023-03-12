import { PoolRow, SingleOrArray } from '@lib/api/types';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs';

export const create = async (
  supabase: SupabaseClient,
  rowData: SingleOrArray<Omit<PoolRow, 'pool_id'>>
): Promise<PoolRow> => {
  const { data, error } = await supabase.from('pool').insert(rowData).select();
  if (error) throw Error(error.message);
  else return data as unknown as Promise<PoolRow>;
};
