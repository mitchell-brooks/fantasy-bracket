import { PoolMetaRow, WithSupabaseClient } from '@lib/api/types.ts';

export const create = async ({
  supabase,
  pool_name,
  admin_user_id,
}: WithSupabaseClient<
  Omit<PoolMetaRow, 'poolmeta_id'>
>): Promise<PoolMetaRow> => {
  const { data, error } = await supabase
    .from('poolmeta')
    .insert({ pool_name, admin_user_id })
    .select();
  if (error) throw Error(error.message);
  return data as unknown as Promise<PoolMetaRow>;
};
