# WS1: Infrastructure Upgrade Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Next.js 13.2 → 15.x, migrate Supabase SDK, fix auth flow, add Vitest, enable stricter TypeScript — without changing any visual or functional behavior (except auth improvement).

**Architecture:** Incremental upgrade approach. Each task produces a working, deployable app. The Supabase SDK migration is the most coupled change (touches auth, middleware, utils, provider, listener). Next.js upgrade is mostly config. TypeScript strictness is a cleanup pass.

**Tech Stack:** Next.js 15, @supabase/ssr, Vitest, React Testing Library

**Spec:** `docs/superpowers/specs/2026-03-15-pre-tournament-improvements-design.md` (WS1 section)

---

## File Map

### Files to Modify
- `package.json` — dependency upgrades
- `next.config.js` — remove experimental appDir, update for Next.js 15
- `tsconfig.json` — stricter settings
- `.eslintrc.json` — update for new eslint-config-next
- `src/middleware.ts` — new Supabase session refresh pattern
- `src/utils/supabase-server.ts` — replace auth-helpers with @supabase/ssr
- `src/utils/supabase-browser.ts` — replace auth-helpers with @supabase/ssr
- `src/components/supabase-provider.tsx` — update client creation
- `src/components/supabase-listener.tsx` — may be removable with new SDK
- `src/components/auth-check.tsx` — review for compatibility
- `src/components/login/login.tsx` — switch to magic link flow
- `src/app/layout.tsx` — update Supabase client creation
- `src/app/pool/[pool_id]/leaderboard/page.tsx` — remove hardcoded competition ID
- `src/app/pool/[pool_id]/draft/[draft_num]/page.tsx` — review for hardcoded values

### Files to Create
- `vitest.config.ts` — Vitest configuration
- `src/__tests__/smoke.test.tsx` — basic smoke tests
- `src/utils/supabase-middleware.ts` — middleware helper (if needed for new SDK pattern)

---

## Chunk 1: Next.js Upgrade & Config

### Task 1: Upgrade Next.js and React dependencies

**Files:**
- Modify: `package.json`
- Modify: `next.config.js`

- [ ] **Step 1: Create a working branch**

```bash
git checkout -b staff/ws1-infrastructure
```

- [ ] **Step 2: Verify the app builds on current dependencies**

Run: `npm run build`
Expected: Build succeeds (may have warnings, that's OK)

- [ ] **Step 3: Upgrade Next.js, React, and related packages**

```bash
npm install next@latest react@latest react-dom@latest eslint-config-next@latest
npm install -D @types/react@latest @types/react-dom@latest
```

- [ ] **Step 4: Update next.config.js**

Remove the experimental appDir flag and update for Next.js 15:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
```

- [ ] **Step 5: Fix any immediate build errors**

Run: `npm run build`

Address errors one at a time. Common Next.js 15 migration issues:
- `next/headers` now returns Promises (headers(), cookies() are async)
- `params` in page/layout components are now Promises
- `searchParams` in page components are now Promises
- Dynamic APIs require `await`

Key files likely affected:
- `src/app/layout.tsx` — uses cookies() via Supabase
- `src/app/page.tsx` — may use params
- `src/app/pool/[pool_id]/**` — all use params.pool_id
- `src/middleware.ts` — uses headers/cookies

For each affected file, update to await the dynamic APIs:
```typescript
// Before (Next.js 13)
export default async function Page({ params }: { params: { pool_id: string } }) {
  const poolId = params.pool_id;

// After (Next.js 15)
export default async function Page({ params }: { params: Promise<{ pool_id: string }> }) {
  const { pool_id: poolId } = await params;
```

- [ ] **Step 6: Verify build succeeds**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 7: Verify dev server works**

Run: `npm run dev`
Visit http://localhost:3000 — verify the site loads and looks correct.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json next.config.js src/
git commit -m "chore: upgrade Next.js to 15.x and React to latest"
```

---

### Task 2: Update ESLint configuration

**Files:**
- Modify: `.eslintrc.json`
- Modify: `package.json` (if eslint plugins need updating)

- [ ] **Step 1: Run lint to see current state**

Run: `npm run lint`
Note any errors or warnings.

- [ ] **Step 2: Update ESLint plugins for compatibility**

Next.js 15 uses ESLint 9 flat config by default, but `.eslintrc.json` still works. Update plugins:

```bash
npm install -D @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest eslint@latest
```

- [ ] **Step 3: Fix any lint configuration errors**

If the eslint config has compatibility issues with newer plugin versions, fix them. The existing config extends airbnb-typescript which may need updates.

- [ ] **Step 4: Verify lint passes**

Run: `npm run lint`
Expected: No errors (warnings acceptable)

- [ ] **Step 5: Commit**

```bash
git add .eslintrc.json package.json package-lock.json
git commit -m "chore: update ESLint config for Next.js 15 compatibility"
```

---

## Chunk 2: Supabase SDK Migration

### Task 3: Replace @supabase/auth-helpers-nextjs with @supabase/ssr

**Files:**
- Modify: `package.json`
- Modify: `src/utils/supabase-server.ts`
- Modify: `src/utils/supabase-browser.ts`
- Modify: `src/middleware.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/supabase-provider.tsx`
- Modify: `src/components/supabase-listener.tsx`
- Modify: `src/lib/database.types.ts` (import path may change)

**Reference:** Check `@supabase/ssr` docs for the latest Next.js App Router patterns. The key change is that `createServerComponentSupabaseClient` is replaced with `createServerClient` from `@supabase/ssr`.

- [ ] **Step 1: Install new packages, keep old ones temporarily**

```bash
npm install @supabase/ssr @supabase/supabase-js@latest
```

- [ ] **Step 2: Update supabase-server.ts**

Replace the auth-helpers server client with `@supabase/ssr`:

```typescript
// ABOUTME: Creates a Supabase client for server-side usage in Server Components
// ABOUTME: Uses cookies for session management via @supabase/ssr
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@lib/database.types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
```

Note: The `!` assertions on env vars are acceptable here because these are required environment variables that will fail at startup if missing. However, if a `assertDefined` utility exists, prefer that.

- [ ] **Step 3: Update supabase-browser.ts**

```typescript
// ABOUTME: Creates a Supabase client for browser-side usage in Client Components
// ABOUTME: Uses @supabase/ssr with default cookie handling
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@lib/database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 4: Update middleware.ts**

The middleware is critical for session refresh with the new SDK:

```typescript
// ABOUTME: Next.js middleware that refreshes Supabase auth sessions on each request
// ABOUTME: Required by @supabase/ssr to keep server-side sessions in sync
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
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
```

- [ ] **Step 5: Update supabase-provider.tsx**

```typescript
// ABOUTME: React context provider that makes the Supabase browser client available to Client Components
// ABOUTME: Creates a single browser client instance shared across the component tree
'use client';

import { createContext, useContext, useState } from 'react';
import { createClient } from '@utils/supabase-browser';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@lib/database.types';

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() => createClient());

  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }
  return context;
};
```

- [ ] **Step 6: Update supabase-listener.tsx**

With `@supabase/ssr`, the listener pattern changes. The middleware handles session refresh, but we still need to listen for auth state changes on the client:

```typescript
// ABOUTME: Listens for Supabase auth state changes and refreshes the page
// ABOUTME: Ensures Server Components re-render when the user signs in or out
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from './supabase-provider';

export default function SupabaseListener() {
  const { supabase } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return null;
}
```

- [ ] **Step 7: Update layout.tsx**

Update the root layout to use the new server client:

Find the Supabase client creation in layout.tsx and replace with:
```typescript
import { createClient } from '@utils/supabase-server';

// In the component body:
const supabase = await createClient();
const {
  data: { session },
} = await supabase.auth.getSession();
```

Note: `createClient` is now async (because `cookies()` is async in Next.js 15).

- [ ] **Step 8: Update all Server Component Supabase usage**

Search for all imports of `createServerComponentSupabaseClient` or the old `supabase-server` pattern. Update each to use the new async `createClient()`:

Files to check and update:
- `src/app/page.tsx`
- `src/app/pool/[pool_id]/page.tsx`
- `src/app/pool/[pool_id]/leaderboard/page.tsx`
- `src/app/pool/[pool_id]/draft/[draft_num]/page.tsx`
- `src/app/pool/[pool_id]/draft/[draft_num]/results/page.tsx`
- `src/app/pool/[pool_id]/roster/[roster_id]/page.tsx`
- `src/app/pool/[pool_id]/rosters/page.tsx`
- `src/app/pool/[pool_id]/teams/page.tsx`
- `src/app/pool/[pool_id]/team/[team_unique]/page.tsx`
- `src/app/pool/[pool_id]/data/page.tsx`
- `src/app/pool/[pool_id]/join/page.tsx`

For each file, the pattern is:
```typescript
// Old
import createClient from '@utils/supabase-server';
const supabase = createClient();

// New
import { createClient } from '@utils/supabase-server';
const supabase = await createClient();
```

- [ ] **Step 9: Update Client Component Supabase usage**

Check all client components that use `useSupabase()` — these should work unchanged since the provider handles the client creation. Verify:
- `src/components/draft-container/draft-container.tsx`
- `src/components/auth-check.tsx`
- Any other `'use client'` components using Supabase

- [ ] **Step 10: Remove old Supabase packages**

```bash
npm uninstall @supabase/auth-helpers-nextjs @supabase/auth-helpers-react @supabase/gotrue-js
```

- [ ] **Step 11: Build and test**

Run: `npm run build`
Expected: Build succeeds

Run: `npm run dev`
Visit http://localhost:3000 — verify site loads, auth works, data displays.

- [ ] **Step 12: Commit**

```bash
git add -A  # After reviewing git status
git commit -m "feat: migrate from @supabase/auth-helpers to @supabase/ssr"
```

---

## Chunk 3: Auth Flow Fix

### Task 4: Switch login to magic link flow

**Files:**
- Modify: `src/components/login/login.tsx`
- Modify: `src/app/login/page.tsx` (if it exists separately)

- [ ] **Step 1: Read the current login component**

Read `src/components/login/login.tsx` and understand the current auth UI setup.

- [ ] **Step 2: Update login to use magic link**

Replace the Supabase Auth UI password form with magic link. There are two approaches:

**Option A:** If using `@supabase/auth-ui-react`, configure it for magic link:
```typescript
<Auth
  supabaseClient={supabase}
  appearance={{ theme: ThemeSupa }}
  providers={[]}
  view="magic_link"
/>
```

**Option B:** Build a simple custom magic link form:
```typescript
'use client';

import { useState } from 'react';
import { useSupabase } from '@components/supabase-provider';

export default function Login() {
  const { supabase } = useSupabase();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <div>
        <h2>Check your email</h2>
        <p>We sent a login link to <strong>{email}</strong></p>
      </div>
    );
  }

  return (
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
  );
}
```

Choose the approach that best matches the current implementation. Option B is simpler and avoids the auth-ui dependency.

- [ ] **Step 3: Handle the magic link callback**

Ensure the auth callback route exists. With `@supabase/ssr`, the middleware handles token exchange automatically when the user clicks the magic link and is redirected back. Verify the redirect URL is configured in Supabase dashboard.

- [ ] **Step 4: Test the full auth flow**

1. Visit /login
2. Enter email
3. Check email for magic link
4. Click link — should redirect to home page logged in
5. Verify profile creation flow still works for new users
6. Verify logout works

- [ ] **Step 5: Remove @supabase/auth-ui packages if no longer needed**

If using Option B:
```bash
npm uninstall @supabase/auth-ui-react @supabase/auth-ui-shared
```

- [ ] **Step 6: Commit**

```bash
git add src/components/login/ src/app/login/ package.json package-lock.json
git commit -m "feat: replace password auth with magic link flow"
```

---

## Chunk 4: Hardcoded Values, TypeScript, Testing

### Task 5: Remove hardcoded values

**Files:**
- Modify: `src/app/pool/[pool_id]/leaderboard/page.tsx`
- Modify: any other files with hardcoded competition IDs or participant counts

- [ ] **Step 1: Search for hardcoded values**

```bash
grep -rn "competition_id.*=" src/ --include="*.tsx" --include="*.ts"
grep -rn "COMPETITION_ID\|competition_id\s*=\s*[0-9]" src/
grep -rn "hardcoded\|TODO\|HACK\|FIXME" src/ --include="*.tsx" --include="*.ts"
```

- [ ] **Step 2: Fix leaderboard competition ID**

The leaderboard has a hardcoded competition ID mapping. Replace with a query:

```typescript
// Instead of hardcoded mapping, get competition_id from the pool
const { data: poolData } = await supabase
  .from('pool')
  .select('competition_id')
  .eq('pool_id', pool_id)
  .single();
const competitionId = poolData?.competition_id;
```

- [ ] **Step 3: Fix participant count**

Replace any hardcoded participant count (9) with a query:

```typescript
const { data: rosters } = await supabase
  .from('roster')
  .select('roster_id')
  .eq('pool_id', pool_id);
const participantCount = rosters?.length ?? 0;
```

- [ ] **Step 4: Fix any other hardcoded values found in Step 1**

Address each one. Common pattern: replace with a database query or derive from existing data.

- [ ] **Step 5: Build and verify**

Run: `npm run build`
Run: `npm run dev` — verify leaderboard and affected pages still work

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "fix: replace hardcoded competition IDs and participant counts with queries"
```

---

### Task 6: Enable stricter TypeScript

**Files:**
- Modify: `tsconfig.json`
- Modify: various source files (to fix new type errors)

- [ ] **Step 1: Update tsconfig.json**

Add stricter settings:

```json
{
  "compilerOptions": {
    "noUncheckedIndexedAccess": true,
    "useUnknownInCatchVariables": true
  }
}
```

- [ ] **Step 2: Build to find type errors**

Run: `npm run build`
Collect all type errors.

- [ ] **Step 3: Fix type errors systematically**

For `noUncheckedIndexedAccess`: Array/object index access now returns `T | undefined`. Fix with:
- Null checks: `if (item !== undefined) { ... }`
- Or use `assertDefined()` utility if one exists

For `useUnknownInCatchVariables`: Catch variables are `unknown` instead of `any`. Fix with:
- `catch (error) { if (error instanceof Error) { ... } }`

- [ ] **Step 4: Verify build passes**

Run: `npm run build`
Expected: No type errors

- [ ] **Step 5: Commit**

```bash
git add tsconfig.json src/
git commit -m "chore: enable noUncheckedIndexedAccess and useUnknownInCatchVariables"
```

---

### Task 7: Add Vitest and smoke tests

**Files:**
- Create: `vitest.config.ts`
- Create: `src/__tests__/smoke.test.tsx`
- Modify: `package.json` (test script)
- Modify: `tsconfig.json` (include test types)

- [ ] **Step 1: Install Vitest and React Testing Library**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: Create vitest.config.ts**

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: [],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
});
```

- [ ] **Step 3: Add test script to package.json**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 4: Write a basic smoke test**

```typescript
// src/__tests__/smoke.test.tsx
import { describe, it, expect } from 'vitest';

describe('smoke tests', () => {
  it('can import utility functions', async () => {
    const utils = await import('@utils/index');
    expect(utils).toBeDefined();
  });
});
```

Note: Full component rendering tests for Server Components require more setup. Keep smoke tests simple for now — the framework is in place for WS2 to write TDD tests for new features.

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: Tests pass

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts src/__tests__/ package.json package-lock.json
git commit -m "chore: add Vitest test framework with smoke tests"
```

---

### Task 8: Final verification and cleanup

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: Clean build with no errors

- [ ] **Step 2: Dev server smoke test**

Run: `npm run dev`
Verify:
- Home page loads
- Login page shows magic link form
- Pool pages load with correct data
- Leaderboard shows correct scores (no hardcoded IDs)
- Draft page loads and shows player data

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 4: Clean up any remaining references to old packages**

Search for any remaining imports of old packages:
```bash
grep -rn "auth-helpers" src/
grep -rn "createServerComponentSupabaseClient\|createBrowserSupabaseClient" src/
```

- [ ] **Step 5: Final commit**

```bash
git add -A  # After reviewing git status
git commit -m "chore: WS1 infrastructure upgrade complete"
```

- [ ] **Step 6: Push branch and open PR**

```bash
git push -u origin staff/ws1-infrastructure
gh pr create --title "WS1: Infrastructure upgrade" --body "$(cat <<'EOF'
## Summary
- Upgrade Next.js 13.2 → 15.x
- Migrate @supabase/auth-helpers → @supabase/ssr
- Fix auth flow (magic link instead of broken password)
- Remove hardcoded competition IDs and participant counts
- Enable stricter TypeScript (noUncheckedIndexedAccess, useUnknownInCatchVariables)
- Add Vitest test framework

## Test plan
- [ ] Site builds cleanly
- [ ] Login flow works end-to-end with magic link
- [ ] Leaderboard shows correct data without hardcoded IDs
- [ ] All existing pages render correctly
- [ ] Tests pass

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
