'use client';
import styles from './login.module.css';

import { useSupabase } from '@components/supabase-provider';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSearchParams } from 'next/navigation';
import { Redirect } from '@components/redirect/redirect';
import { User } from '@supabase/gotrue-js';

export const Login = ({ user }: { user: User | null }) => {
  console.log('::: inside login user', user);
  const { supabase } = useSupabase();
  const searchParams = useSearchParams();
  const return_to = searchParams.get('return_to');
  if (user) {
    return (
      <>
        <h1>Logged in</h1>
        <Redirect to={return_to || '/'} />
      </>
    );
  }
  return (
    <>
      <div className={styles.container}>
        {return_to ? <p> You'll have to be logged in to do that. </p> : null}
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            style: {
              button: {
                background: 'white',
                color: 'black',
                border: '2px solid black',
              },
            },
            // variables: {
            //   default: {
            //     colors: {
            //       brand: 'red',
            //       brandAccent: 'darkred',
            //     },
            //   },
            // },
          }}
          // localization={{
          //   variables: {
          //     sign_in: {
          //       email_label: 'Your email address',
          //       password_label: 'Your strong password',
          //     },
          //   },
          // }}
          redirectTo={'localhost:3000/pool/1'}
        />
      </div>
    </>
  );
};
