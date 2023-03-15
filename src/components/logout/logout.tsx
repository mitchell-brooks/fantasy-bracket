'use client';

import { useSupabase } from '@components/supabase-provider';

export const Logout = () => {
  const { supabase } = useSupabase();
  const signOut = async () => {
    await supabase.auth.signOut();
  };
  signOut();
  return <></>;
};
