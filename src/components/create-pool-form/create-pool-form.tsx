'use client';
import { useSupabase } from '@components/supabase-provider';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { Database } from '@lib/database.types';
import * as api from '@lib/api';
import {
  PoolMetaRow,
  PoolRow,
  PoolRule_DraftRow,
  PoolRule_PrizeSplitRow,
} from '@lib/api';
import React from 'react';

type PoolOptions = Database['public']['Tables']['pool']['Row'];
interface PoolForm extends PoolOptions {
  poolrule_mvp?: [Database['public']['Tables']['poolrule_mvp']['Row']];
  poolrule_draft?: [Database['public']['Tables']['poolrule_draft']['Row']];
  poolrule_prizesplit?: [
    Database['public']['Tables']['poolrule_prizesplit']['Row']
  ];
  pool_name: Database['public']['Tables']['poolmeta']['Row']['pool_name'];
}

interface CreatePoolFormProps {
  user_id?: string;
  competition_id: number;
}
type FormValues = Omit<PoolMetaRow, 'poolmeta_id'> &
  Omit<PoolRow, 'pool_id'> &
  PoolRule_DraftRow & { poolrule_prizesplit: [number] }; // [PoolRule_PrizeSplitRow] &

export default function CreatePoolForm({
  user_id,
  competition_id,
}: CreatePoolFormProps): JSX.Element {
  const { supabase } = useSupabase();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  // const [poolmeta_id, setPoolMetaId] = React.useState<number>();
  // const [pool_id, setPoolId] = React.useState<number>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const defaultValues = { currency: 'USD' };
    const {
      pool_name,
      point_value,
      roster_count,
      draft_time,
      poolrule_prizesplit,
    } = data;
    // TODO: add error handling
    // TODO: extract all of these into api calls
    if (user_id) {
      // const { poolmeta_id: pm_id }
      const poolMetaRows = await api.supabase.create<
        PoolMetaRow,
        'poolmeta_id'
      >(supabase, 'poolmeta', {
        pool_name,
        admin_user_id: user_id,
      });
      const { poolmeta_id } = poolMetaRows?.[0];
      if (poolmeta_id) {
        // console.log(':::poolmeta_id', poolmeta_id);
        const poolRows = await api.supabase.create<PoolRow, 'pool_id'>(
          supabase,
          'pool',
          {
            currency: 'USD',
            competition_id,
            poolmeta_id,
            point_value,
          }
        );
        const { pool_id } = poolRows?.[0];
        // setPoolId(p_id);
        if (pool_id) {
          // console.log(':::pool_id', pool_id);
          const poolrule_draft_res =
            await api.supabase.create<PoolRule_DraftRow>(
              supabase,
              'poolrule_draft',
              {
                pool_id,
                draft_time,
                roster_count,
                draft_order: 0,
                round_num: 1,
                draft_num: 1,
              }
            );
          // console.log(':::poolrule_draft_res', poolrule_draft_res);
          const poolrule_prizesplit_row = poolrule_prizesplit?.map(
            (percent, idx) => ({
              percent_split: percent,
              recipient: (idx + 1).toString(),
              pool_id,
            })
          );
          // console.log(':::poolrule_prizesplit_row', poolrule_prizesplit_row);
          if (poolrule_prizesplit_row.length > 0) {
            const poolrule_prizesplit_res = await api.supabase.create<
              PoolRule_PrizeSplitRow[]
            >(supabase, 'poolrule_prizesplit', poolrule_prizesplit_row);
          }
        }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <form onSubmit={handleSubmit((values) => onSubmit(values as FormValues))}>
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
}
