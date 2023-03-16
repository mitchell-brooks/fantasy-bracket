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
    <>
      <h1>Create a profile</h1>
      <div className={styles.container}>
        <form className={styles.form} onSubmit={onFormSubmit}>
          <div>
            <label htmlFor="username">Username</label>
            <br />
          </div>
          <div>
            <input type="text" name="username" id="username" />
            <br />
          </div>
          <div>
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </>
  );
};
