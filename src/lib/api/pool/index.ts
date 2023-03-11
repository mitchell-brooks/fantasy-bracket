import { PoolRow, WithSupabaseClient } from '@lib/api/types.ts';

export const create = async ({
  supabase,
  ...rowData
}: WithSupabaseClient<Omit<PoolRow, 'pool_id'>>): Promise<PoolRow> => {
  const { data, error } = await supabase.from('pool').insert(rowData).select();
  if (error) throw Error(error.message);
  return data as unknown as Promise<PoolRow>;
};
