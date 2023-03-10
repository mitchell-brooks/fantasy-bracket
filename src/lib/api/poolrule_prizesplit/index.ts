import { PoolRule_PrizeSplitRow, SingleOrArray } from '@lib/api/types';

export const create = async ({
  supabase,
  ...rowData
}: SingleOrArray<
  PoolRule_PrizeSplitRow | { rows: PoolRule_PrizeSplitRow[] }
>): Promise<PoolRule_PrizeSplitRow> => {
  const { data, error } = await supabase
    .from('poolrule_prizesplit')
    .insert(rowData)
    .select();
  if (error) throw Error(error.message);
  else return data as unknown as Promise<PoolRule_PrizeSplitRow>;
};
