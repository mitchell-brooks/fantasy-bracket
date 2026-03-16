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
    return (
      <>
        <h1>Logged in</h1>
        <Redirect to={return_to || '/'} />
      </>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
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
        <h2>Check your email</h2>
        <p>We sent a login link to <strong>{email}</strong></p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {return_to ? <p>You&apos;ll have to be logged in to do that.</p> : null}
      <form onSubmit={handleSubmit}>
        <h2>Sign in to Bracketude</h2>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send magic link</button>
        {error && <p style={{ color: 'var(--accent-primary, red)' }}>{error}</p>}
      </form>
    </div>
  );
};
