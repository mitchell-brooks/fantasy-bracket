// ABOUTME: Button component that creates a roster entry to add a user to a pool
// ABOUTME: Calls the Supabase API to insert a roster row and redirects to the pool page
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@components/supabase-provider';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as api from '@lib/api';
import { RosterRow } from '@lib/api';

interface JoinButtonProps {
  user_id: string;
  pool_id: number;
}
export const JoinButton: React.FC<JoinButtonProps> = ({ user_id, pool_id }) => {
  const { supabase } = useSupabase();
  const user = supabase.auth.getUser();
  // console.log(roster);
  const router = useRouter();
  const joinPool = async ({}) => {
    const rosterData = await api.supabase.create<RosterRow, 'roster_id'>(
      supabase,
      'roster',
      {
        pool_id,
        user_id,
        roster_name: null,
      }
    );
    if (rosterData) router.push(`pool/${pool_id}`);
  };

  return (
    <button
      onClick={() => joinPool({ supabase, pool_id, user_id })}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: '1.6rem',
        fontWeight: 700,
        padding: '1rem 3rem',
        backgroundColor: 'var(--color-accent-primary)',
        color: 'var(--color-bg-surface)',
        border: '2px solid var(--color-accent-primary)',
        borderRadius: 'var(--radius)',
        cursor: 'pointer',
        width: '100%',
      }}
    >
      Join Pool
    </button>
  );
};
