import { createClient } from '@utils/supabase-server';
import { Login } from '@components/login/login';
import { getUser } from '@lib/api/supabase';
import { Suspense } from 'react';

export default async function LoginPage() {
  const supabase = createClient();
  const user = await getUser(supabase);
  console.log('user', user);
  return (
    <>
      <Suspense fallback={<></>}>
        <Login user={user} />
      </Suspense>
    </>
  );
}
