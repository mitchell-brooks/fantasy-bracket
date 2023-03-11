'use client';
import { useSupabase } from '@components/supabase-provider';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { Database } from '@lib/database.types';

type PoolOptions = Database['public']['Tables']['pool']['Row'];
interface PoolForm extends PoolOptions {
  poolrule_mvp?: [Database['public']['Tables']['poolrule_mvp']['Row']];
  poolrule_redraft?: [Database['public']['Tables']['poolrule_redraft']['Row']];
  poolrule_prizesplit?: [
    Database['public']['Tables']['poolrule_prizesplit']['Row']
  ];
  pool_name: Database['public']['Tables']['poolmeta']['Row']['pool_name'];
}

interface CreatePoolFormProps {
  user_id?: string;
  competition_id: number;
}

interface PreparePoolOptionsArgs {
  poolOptions: Pick<PoolOptions, 'point_value' | 'roster_count' | 'draft_time'>;
  competition_id: number;
  poolmeta_id: number;
}
const preparePoolOptions = ({
  poolOptions,
  competition_id,
  poolmeta_id,
}: PreparePoolOptionsArgs): Omit<PoolOptions, 'pool_id'> => {
  if (poolOptions.draft_time) {
    poolOptions.draft_time = new Date(poolOptions.draft_time).toISOString();
  }
  const rowValues = {
    currency: 'USD',
    competition_id,
    poolmeta_id,
    ...poolOptions,
  };
  return rowValues;
};

const CreatePoolForm: React.FC<CreatePoolFormProps> = ({
  user_id,
  competition_id,
}) => {
  const { supabase } = useSupabase();
  // console.log(':::userData', userData);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const defaultValues = { currency: 'USD' };
    const { pool_name, poolrule_prizesplit, ...poolOptions } = data;
    // TODO: add error handling
    // TODO: extract all of these into api calls
    if (user_id) {
      const poolmeta_id = await poolmeta_id;

      if (poolmeta_id) {
        const pool_id = pool_res?.[0].pool_id;

        if (pool_id) {
          const { data: pool_user_res, error } = await supabase
            .from('user_pool')
            .insert({ pool_id, user_id });
          const { data: poolrule_draft_res, error } = await supabase
            .from('poolrule_draft')
            .insert({ pool_id, draft_time: poolOptions.draft_time });
          const { data: poolrule_prizesplit_res, error } = await supabase
            .from('poolrule_prizesplit')
            .insert({ pool_id, ...poolrule_prizesplit });
        }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="pool_name">Pool Name</label>
        <input {...register('pool_name', { required: true })} />
        <br />
        <label htmlFor="point_value">Point Value</label>
        <input
          type="number"
          min={1}
          max={1000}
          step={1}
          {...register('point_value', {
            min: 1,
            max: 1000,
            value: 5,
            required: true,
          })}
        />
        <br />
        <label htmlFor="roster_count">Number of Players</label>
        <input type="number" min={1} max={20} {...register('roster_count')} />
        <br />
        <label htmlFor="draft_time">Draft Time</label>
        <input type="datetime-local" {...register('draft_time')} />
        <br />
        <label htmlFor="poolrule_prizesplit">Prize Split</label>
        <br />
        {/* TODO: split this into a multi-part form */}
        {/* TODO: validation for 100% split*/}
        {/* TODO: dynamically add buttons for more splits */}
        <label htmlFor="poolrule_prizesplit[0]">1st Place</label>
        <input
          type="number"
          min={0}
          max={100}
          {...register('poolrule_prizesplit[0]')}
        />
        <br />
        <label htmlFor="poolrule_prizesplit[1]">2nd Place</label>
        <input
          type="number"
          min={0}
          max={100}
          {...register('poolrule_prizesplit[1]')}
        />
        <br />
        <label htmlFor="poolrule_prizesplit[2]">3rd Place</label>
        <input
          type="number"
          min={0}
          max={100}
          {...register('poolrule_prizesplit[2]')}
        />
        <br />
        <input type="submit" />
      </form>
    </div>
  );
};

export default CreatePoolForm;
