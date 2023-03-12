import { PoolRule_DraftRow, SingleOrArray } from '@lib/api/types';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs';

export const create = async (
  supabase: SupabaseClient,
  rowData: PoolRule_DraftRow | PoolRule_DraftRow[]
): Promise<PoolRule_DraftRow> => {
  const { data, error } = await supabase
    .from('poolrule_draft')
    .insert(rowData)
    .select();
  if (error) throw Error(error.message);
  else return data as unknown as Promise<PoolRule_DraftRow>;
};
