import { PoolRule_DraftRow, WithSupabaseClient } from '@lib/api/types.ts';

export const create = async ({
  supabase,
  ...rowData
}: WithSupabaseClient<PoolRule_DraftRow>): Promise<PoolRule_DraftRow> => {
  const { data, error } = await supabase
    .from('poolrule_draft')
    .insert(rowData)
    .select();
  if (error) throw Error(error.message);
  else return data as unknown as Promise<PoolRule_DraftRow>;
};
