// ABOUTME: Form component for creating a new pool with draft rules and prize splits
// ABOUTME: Handles pool metadata, draft settings, and prize split configuration via react-hook-form
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
import { useRouter } from 'next/navigation';
import styles from './create-pool-form.module.css';
import type { ActiveCompetition, CompetitionRound } from '@/app/pool/create/page';

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
  competitions: ActiveCompetition[];
}
type FormValues = Omit<PoolMetaRow, 'poolmeta_id'> &
  Omit<PoolRow, 'pool_id'> &
  PoolRule_DraftRow & { poolrule_prizesplit: [number] }; // [PoolRule_PrizeSplitRow] &

export default function CreatePoolForm({
  user_id,
  competitions,
}: CreatePoolFormProps): React.JSX.Element {
  const { supabase } = useSupabase();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const selectedCompetitionId = watch('competition_id');
  const selectedCompetition = competitions.find(
    (c) => c.competition_id === Number(selectedCompetitionId)
  );
  const rounds = selectedCompetition?.rounds ?? competitions[0]?.rounds ?? [];

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const {
      pool_name,
      point_value,
      roster_count,
      draft_time,
      competition_id,
      round_num,
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
      const poolmeta_id = poolMetaRows?.[0]?.poolmeta_id;
      if (poolmeta_id) {
        // console.log(':::poolmeta_id', poolmeta_id);
        const poolRows = await api.supabase.create<PoolRow, 'pool_id'>(
          supabase,
          'pool',
          {
            currency: 'cent',
            competition_id: Number(competition_id),
            poolmeta_id,
            point_value,
          }
        );
        const pool_id = poolRows?.[0]?.pool_id;
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
                round_num: Number(round_num),
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
          router.push(`/pool/${pool_id}/join`);
        }
      }
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit((values) => onSubmit(values as FormValues))}>
      <div className={styles.field}>
        <label htmlFor="competition_id" title="Select the tournament for this pool">Tournament</label>
        <select id="competition_id" {...register('competition_id', { required: true })}>
          {competitions.map((c) => (
            <option key={c.competition_id} value={c.competition_id}>
              {c.display_name} {c.identifier ?? c.season ?? ''}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="pool_name" title="A display name for your pool, visible to all participants">Pool Name</label>
        <input id="pool_name" {...register('pool_name', { required: true })} />
      </div>

      <div className={styles.field}>
        <label htmlFor="point_value" title="How much each tournament point is worth in cents. Multiplied by total points to determine payouts.">Point Value (&cent;)</label>
        <input
          id="point_value"
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
      </div>

      <div className={styles.field}>
        <label htmlFor="roster_count" title="How many players each participant drafts for their roster">Number of Players</label>
        <input id="roster_count" type="number" min={1} max={20} {...register('roster_count')} />
      </div>

      <div className={styles.field}>
        <label htmlFor="round_num" title="The tournament round this draft's players start scoring in">Starting Round</label>
        <select id="round_num" {...register('round_num', { required: true })}>
          {rounds.map((r) => (
            <option key={r.round_num} value={r.round_num}>
              {r.round_name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="draft_time" title="When participants need to have their draft rankings submitted by">Draft Time</label>
        <input id="draft_time" type="datetime-local" {...register('draft_time')} />
      </div>

      {/* TODO: validation for 100% split */}
      {/* TODO: dynamically add buttons for more splits */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle} title="How the prize pool is divided among top finishers. Should total 100%.">Prize Split (%)</h3>
        <div className={styles.splitGroup}>
          <div className={styles.field}>
            <label htmlFor="poolrule_prizesplit[0]" title="Percentage of the prize pool awarded to 1st place">1st</label>
            <input
              id="poolrule_prizesplit[0]"
              type="number"
              min={0}
              max={100}
              {...register('poolrule_prizesplit[0]')}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="poolrule_prizesplit[1]" title="Percentage of the prize pool awarded to 2nd place">2nd</label>
            <input
              id="poolrule_prizesplit[1]"
              type="number"
              min={0}
              max={100}
              {...register('poolrule_prizesplit[1]')}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="poolrule_prizesplit[2]" title="Percentage of the prize pool awarded to 3rd place">3rd</label>
            <input
              id="poolrule_prizesplit[2]"
              type="number"
              min={0}
              max={100}
              {...register('poolrule_prizesplit[2]')}
            />
          </div>
        </div>
      </div>

      <button type="submit" className={styles.submitButton}>Create Pool</button>
    </form>
  );
}
