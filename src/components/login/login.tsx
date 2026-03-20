// ABOUTME: Login component that sends magic link emails for passwordless auth
// ABOUTME: Redirects already-logged-in users to their return_to destination
'use client';
import styles from './login.module.css';

import { useState } from 'react';
import { useSupabase } from '@components/supabase-provider';
import { useSearchParams } from 'next/navigation';
import { Redirect } from '@components/redirect/redirect';
import type { User } from '@supabase/supabase-js';

export const Login = ({ user }: { user: User | null }) => {
  const { supabase } = useSupabase();
  const searchParams = useSearchParams();
  const return_to = searchParams.get('return_to');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Redirect to={return_to || '/'} />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const redirectPath = return_to || '/';
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}${redirectPath}`,
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2>Check your email</h2>
          <p>We sent a login link to <strong>{email}</strong></p>
          {return_to && (
            <p className={styles.notice}>You&apos;ll be taken to your destination after signing in.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Sign in to Bracketude</h2>
        <p className={styles.notice}>Enter your email to sign in or create an account. We&apos;ll send you a link — no password needed.</p>
        {return_to ? <p className={styles.notice}>You&apos;ll need to log in to continue.</p> : null}
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.emailInput}
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className={styles.submitButton}>Send magic link</button>
          {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
};
