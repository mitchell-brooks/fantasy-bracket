import styles from './page.module.css';
import { createClient } from '@utils/supabase-server';
import React from 'react';
import Link from 'next/link';
import { getUser } from '@lib/api/supabase';
import { Grid } from '@components/grid/grid';

export const revalidate = 0;

export default async function Home() {
  const supabase = createClient();
  // move into layout main?
  const user = await getUser(supabase);
  console.log('user', user);
  if (!user) {
    return (
      // <Grid leftContent={
      <h2>Log in or sign up.</h2>
      // } />
    );
  }
  const user_id = user.id;
  // TODO create view for this? it works fine as-is
  // TODO do is RLS okay here? Only  able to select pools where user is in roster
  // does a user ever need to access rosters they aren't a part of?
  const { data: pool_data, error: pool_error } = await supabase
    .from('roster_full_view')
    .select('*')
    .eq('user_id', user_id);
  // TODO this will become its own component, I think
  const poolLinks = pool_data?.map((pool) => {
    return (
      <li key={pool.pool_id}>
        <Link href={`/pool/${pool.pool_id}`}>
          {pool?.pool_name || 'Untitled Pool'}
        </Link>
      </li>
    );
  });
  return (
    // <Grid leftContent={
    <main className={styles.main}>
      <h2>Your pools:</h2>
      <ul>{poolLinks}</ul>
      {/*<Link href="/pool/create">Create a new pool</Link>*/}
    </main>
    // }
    // />
  );
}
