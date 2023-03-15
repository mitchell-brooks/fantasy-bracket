'use client';

import { createClient } from '@utils/supabase-server';
import styles from '@components/header/header.module.css';
import Link from 'next/link';
import React from 'react';
import { useSupabase } from '@components/supabase-provider';

export const LogoutLink = ({ user_id }: { user_id: string | undefined }) => {
  const { supabase } = useSupabase();
  const signOut = async () => {
    await supabase.auth.signOut();
  };
  if (!user_id) {
    return (
      <Link className={styles.headerlink} href="/login">
        Log in
      </Link>
    );
  }
  return (
    <a className={styles.headerlink} onClick={signOut}>
      Log out
    </a>
  );
};
