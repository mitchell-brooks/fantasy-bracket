import { User_PoolRow, SingleOrArray } from '@lib/api/types';

export const create = async ({
  supabase,
  ...rowData
}: SingleOrArray<
  User_PoolRow | [User_PoolRow]
>): Promise<User_PoolRow> => {
  const { data, error } = await supabase
    .from('user_pool')
    .insert(rowData)
    .select();
  if (error) throw Error(error.message);
  else return data as unknown as Promise<User_PoolRow>;
};
