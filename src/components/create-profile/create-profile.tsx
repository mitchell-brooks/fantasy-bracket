// ABOUTME: Form component for setting a username during initial profile creation
// ABOUTME: Submits the username to the userprofile table and redirects to home on success
'use client';
import styles from './create-profile.module.css';
import { useCallback } from 'react';
import { useSupabase } from '@components/supabase-provider';
import { useRouter } from 'next/navigation';

export const CreateProfile = ({ user_id }: { user_id: string }) => {
  const { supabase } = useSupabase();
  const router = useRouter();
  const onFormSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const username = formData.get('username') as string;
      const { data, error } = await supabase
        .from('userprofile')
        .update({ username })
        .eq('user_id', user_id);
      if (!error) {
        router.push(`/`);
      }
    },
    [user_id]
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Create your profile</h2>
        <p>Choose a display name that other players will see.</p>
        <form className={styles.form} onSubmit={onFormSubmit}>
          <div className={styles.field}>
            <label htmlFor="username">Display Name</label>
            <input type="text" name="username" id="username" required />
          </div>
          <button type="submit" className={styles.submitButton}>Continue</button>
        </form>
      </div>
    </div>
  );
};
