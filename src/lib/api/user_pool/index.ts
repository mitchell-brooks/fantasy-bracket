import { User_PoolRow, WithSupabaseClient } from '@lib/api/types.ts';

export const create = async ({
  supabase,
  ...rowData
}: WithSupabaseClient<User_PoolRow>): Promise<User_PoolRow> => {
  const { data, error } = await supabase
    .from('user_pool')
    .insert(rowData)
    .select();
  if (error) throw Error(error.message);
  return data as unknown as Promise<User_PoolRow>;
};
