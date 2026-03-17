// ABOUTME: Form component for creating a new pool with draft rules and prize splits
// ABOUTME: Handles pool metadata, multi-draft settings, and prize split configuration
'use client';
import { useSupabase } from '@components/supabase-provider';
import { useForm } from 'react-hook-form';
import { Database } from '@lib/database.types';
import * as api from '@lib/api';
import {
  PoolMetaRow,
  PoolRow,
  PoolRule_DraftRow,
  PoolRule_PrizeSplitRow,
} from '@lib/api';
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './create-pool-form.module.css';
import type { ActiveCompetition, CompetitionRound } from '@/app/pool/create/page';

interface DraftEntry {
  id: number;
  round_num: string;
  roster_count: string;
  draft_time: string;
}

interface CreatePoolFormProps {
  user_id?: string;
  competitions: ActiveCompetition[];
}

let nextDraftId = 1;

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

  const [drafts, setDrafts] = useState<DraftEntry[]>(() => [{
    id: nextDraftId++,
    round_num: '',
    roster_count: '',
    draft_time: '',
  }]);

  const addDraft = useCallback(() => {
    setDrafts(prev => {
      const lastDraft = prev[prev.length - 1];
      const lastRound = Number(lastDraft?.round_num) || 0;
      const nextRound = rounds.find(r => r.round_num > lastRound);
      return [...prev, {
        id: nextDraftId++,
        round_num: nextRound ? String(nextRound.round_num) : '',
        roster_count: lastDraft?.roster_count ?? '',
        draft_time: '',
      }];
    });
  }, [rounds]);

  const removeDraft = useCallback((id: number) => {
    setDrafts(prev => prev.length > 1 ? prev.filter(d => d.id !== id) : prev);
  }, []);

  const updateDraft = useCallback((id: number, field: keyof Omit<DraftEntry, 'id'>, value: string) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  }, []);

  const sortedDrafts = [...drafts].sort((a, b) => {
    const aRound = Number(a.round_num) || 0;
    const bRound = Number(b.round_num) || 0;
    return aRound - bRound;
  });

  const onSubmit = async (formData: Record<string, unknown>) => {
    const {
      pool_name,
      point_value,
      competition_id,
      poolrule_prizesplit,
    } = formData as { pool_name: string; point_value: number; competition_id: string; poolrule_prizesplit: number[] };

    if (!user_id) return;

    const poolMetaRows = await api.supabase.create<PoolMetaRow, 'poolmeta_id'>(
      supabase, 'poolmeta', {
        pool_name,
        admin_user_id: user_id,
      }
    );
    const poolmeta_id = poolMetaRows?.[0]?.poolmeta_id;
    if (!poolmeta_id) return;

    const poolRows = await api.supabase.create<PoolRow, 'pool_id'>(
      supabase, 'pool', {
        currency: 'cent',
        competition_id: Number(competition_id),
        poolmeta_id,
        point_value,
      }
    );
    const pool_id = poolRows?.[0]?.pool_id;
    if (!pool_id) return;

    for (let i = 0; i < sortedDrafts.length; i++) {
      const draft = sortedDrafts[i];
      if (!draft) continue;
      await api.supabase.create<PoolRule_DraftRow>(
        supabase, 'poolrule_draft', {
          pool_id,
          draft_time: draft.draft_time,
          roster_count: Number(draft.roster_count),
          draft_order: 0,
          round_num: Number(draft.round_num),
          draft_num: i + 1,
        }
      );
    }

    if (poolrule_prizesplit) {
      const prizeSplitRows = poolrule_prizesplit
        .filter((p) => p !== undefined && p !== null && String(p) !== '')
        .map((percent, idx) => ({
          percent_split: Number(percent),
          recipient: (idx + 1).toString(),
          pool_id,
        }));
      if (prizeSplitRows.length > 0) {
        await api.supabase.create<PoolRule_PrizeSplitRow[]>(
          supabase, 'poolrule_prizesplit', prizeSplitRows
        );
      }
    }

    router.push(`/pool/${pool_id}/join`);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.field}>
        <label htmlFor="competition_id">Tournament</label>
        <p className={styles.hint}>Select the tournament for this pool</p>
        <select id="competition_id" {...register('competition_id', { required: true })}>
          {competitions.map((c) => (
            <option key={c.competition_id} value={c.competition_id}>
              {c.display_name} {c.identifier ?? c.season ?? ''}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="pool_name">Pool Name</label>
        <p className={styles.hint}>Visible to all participants</p>
        <input id="pool_name" {...register('pool_name', { required: true })} />
      </div>

      <div className={styles.field}>
        <label htmlFor="point_value">Point Value (&cent;)</label>
        <p className={styles.hint}>How much each tournament point is worth in cents</p>
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

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Draft Rounds</h3>
        <p className={styles.hint}>Each draft round has its own starting round, roster size, and deadline. Players only accumulate points scored in rounds after they were drafted. Sorted by round automatically.</p>

        {sortedDrafts.map((draft, idx) => (
          <div key={draft.id} className={styles.draftRound}>
            <div className={styles.draftRoundHeader}>
              <span className={styles.draftRoundLabel}>Draft {idx + 1}</span>
              {drafts.length > 1 && (
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeDraft(draft.id)}
                >
                  Remove
                </button>
              )}
            </div>
            <div className={styles.draftRoundFields}>
              <div className={styles.field}>
                <label>Starting Round</label>
                <select
                  value={draft.round_num}
                  onChange={(e) => updateDraft(draft.id, 'round_num', e.target.value)}
                  required
                >
                  <option value="">Select round</option>
                  {rounds.map((r) => (
                    <option key={r.round_num} value={r.round_num}>
                      {r.round_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Players</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={draft.roster_count}
                  onChange={(e) => updateDraft(draft.id, 'roster_count', e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Draft Deadline</label>
                <input
                  type="datetime-local"
                  value={draft.draft_time}
                  onChange={(e) => updateDraft(draft.id, 'draft_time', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        ))}

        <button type="button" className={styles.addButton} onClick={addDraft}>
          + Add Draft Round
        </button>
      </div>

      {/* TODO: validation for 100% split */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Prize Split (%)</h3>
        <p className={styles.hint}>How the prize pool is divided. Should total 100%.</p>
        <div className={styles.splitGroup}>
          <div className={styles.field}>
            <label htmlFor="poolrule_prizesplit[0]">1st</label>
            <input
              id="poolrule_prizesplit[0]"
              type="number"
              min={0}
              max={100}
              {...register('poolrule_prizesplit[0]')}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="poolrule_prizesplit[1]">2nd</label>
            <input
              id="poolrule_prizesplit[1]"
              type="number"
              min={0}
              max={100}
              {...register('poolrule_prizesplit[1]')}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="poolrule_prizesplit[2]">3rd</label>
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
