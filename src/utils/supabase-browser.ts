// ABOUTME: Creates a Supabase client for browser-side usage in Client Components
// ABOUTME: Uses @supabase/ssr with default cookie handling
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@lib/database.types';
import { assertDefined } from '@utils/index';

export function createClient() {
  const supabaseUrl = assertDefined(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable'
  );
  const supabaseAnonKey = assertDefined(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable'
  );

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  );
}
