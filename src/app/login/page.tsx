// ABOUTME: Login page that renders the Login component with current user state
// ABOUTME: Server component that fetches auth state and passes it to the client login form
import { createClient } from '@utils/supabase-server';
import { Login } from '@components/login/login';
import { getUser } from '@lib/api/supabase';
import { Suspense } from 'react';

export default async function LoginPage() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  // console.log('roster', roster);
  return (
    <>
      <Suspense fallback={<></>}>
        <Login user={user} />
      </Suspense>
    </>
  );
}
