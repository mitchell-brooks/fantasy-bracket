'use client';

import { useSupabase } from './supabase-provider';

// Supabase auth needs to be triggered client-side
export default function Login() {
  const { supabase /*, session*/ } = useSupabase();

  const handleEmailLogin = async () => {
    await supabase.auth
      .signInWithPassword({
        email: 'MitchellBrooks+test2@gmail.com',
        password: 'password',
      })
      .then((res) => {
        // console.log(':::login res', res);
      });
  };

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const setPassword = async () => {
    await supabase.auth.updateUser({ password: 'password' }).then((res) => {
      // console.log(res);
    });
  };

  return (
    <>
      <button onClick={handleEmailLogin}>Email Login</button>
      <button onClick={handleGitHubLogin}>GitHub Login</button>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={setPassword}>Set Password</button>
    </>
  );
}
