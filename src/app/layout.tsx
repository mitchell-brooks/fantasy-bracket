import 'server-only';

import './theme.css';
import './globals.css';
import styles from './layout.module.css';

import localFont from 'next/font/local';
import { Quicksand } from 'next/font/google';

import SupabaseListener from '@/components/supabase-listener';
import SupabaseProvider from '@/components/supabase-provider';
import { createClient } from '@utils/supabase-server';
import Login from '@components/auth';
import { Redirect } from '@components/redirect/redirect';
import { AuthCheck } from '@components/auth-check/auth-check';
import { Header } from '@components/header/header';
import { Grid } from '@components/grid/grid';

const tiltWarp = localFont({
  src: '../assets/fonts/TiltWarp-Regular.ttf',
  variable: '--font-tilt-warp',
  display: 'swap',
});

const quicksand = Quicksand({
  variable: '--font-quicksand',
  display: 'swap',
  subsets: ['latin'],
});

export const revalidate = 0;
export const metadata = {
  title: 'Bracketude',
  description: 'Live your bracket fantasy',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user_id = session?.user?.id;
  // console.log('::: user_id', user_id);

  // console.log('::: session', session);

  return (
    <html lang="en" className={`${tiltWarp.variable} ${quicksand.variable}`}>
      {/*
      <head /> will contain the components returned by the nearest parent
      head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
    */}
      <body>
        <SupabaseProvider>
          <SupabaseListener serverAccessToken={session?.access_token} />
          <Header user_id={user_id} />
          <AuthCheck user_id={user_id} />
          <Grid leftContent={children} />
          {/*{children}*/}
        </SupabaseProvider>
        <div className="paperOverlay" />
      </body>
    </html>
  );
}
