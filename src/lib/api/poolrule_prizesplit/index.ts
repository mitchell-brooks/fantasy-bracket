import { PoolRule_PrizeSplitRow, WithSupabaseClient } from '@lib/api/types.ts';

export const create = async ({
  supabase,
  ...rowData
}: WithSupabaseClient<PoolRule_PrizeSplitRow>): Promise<PoolRule_PrizeSplitRow> => {
  const { data, error } = await supabase
    .from('poolrule_prizesplit')
    .insert(rowData)
    .select();
  if (error) throw Error(error.message);
  else return data as unknown as Promise<PoolRule_PrizeSplitRow>;
};
