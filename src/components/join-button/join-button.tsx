'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@components/supabase-provider';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs';
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
    <>
      <button onClick={() => joinPool({ supabase, pool_id, user_id })}>
        Join Pool
      </button>
    </>
  );
};
