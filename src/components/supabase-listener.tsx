'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSupabase } from '@/components/supabase-provider';

export default function SupabaseListener({
  serverAccessToken,
}: {
  serverAccessToken?: string;
}) {
  const { supabase } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // console.log(
      //   ':::inside onAuthStateChange:::',
      //   event,
      //   session?.access_token,
      //   serverAccessToken
      // );
      if (session?.access_token !== serverAccessToken) {
        // console.log('---inside new serveraccess token---');
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [serverAccessToken, router, supabase]);

  return null;
}
