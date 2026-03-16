// ABOUTME: Next.js middleware that refreshes Supabase auth sessions on each request
// ABOUTME: Required by @supabase/ssr to keep server-side sessions in sync
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { assertDefined } from '@utils/index';

const supabaseUrl = assertDefined(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  'Missing NEXT_PUBLIC_SUPABASE_URL environment variable'
);
const supabaseAnonKey = assertDefined(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable'
);

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session - important for Server Components
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
