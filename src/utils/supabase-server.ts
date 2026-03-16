// ABOUTME: Creates a Supabase client for server-side usage in Server Components
// ABOUTME: Uses cookies for session management via @supabase/ssr
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@lib/database.types';
import { assertDefined } from '@utils/index';

const supabaseUrl = assertDefined(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  'Missing NEXT_PUBLIC_SUPABASE_URL environment variable'
);
const supabaseAnonKey = assertDefined(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable'
);

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if middleware refreshes sessions.
          }
        },
      },
    }
  );
}
