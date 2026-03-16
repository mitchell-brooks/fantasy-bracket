// ABOUTME: Component that triggers Supabase sign-out immediately on mount
// ABOUTME: Renders nothing visible, used on the logout page to perform the sign-out action
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
