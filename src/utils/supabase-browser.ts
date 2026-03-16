// ABOUTME: Creates a Supabase client for browser-side usage in Client Components
// ABOUTME: Uses @supabase/ssr with default cookie handling
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@lib/database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
