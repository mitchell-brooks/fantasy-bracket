import { createClient } from '@utils/supabase-server';
import React from 'react';
import { JoinButton } from '@components/join-button/join-button';
import { Redirect } from '@components/redirect/redirect';

export default async function PoolJoinPage({
  params: { pool_id },
}: {
  params: { pool_id: number };
}) {
  const supabase = createClient();
  const { data: user_data, error: user_error } = await supabase.auth.getUser();
  const user_id = user_data?.user?.id;
  const { data: pool_data, error: pool_error } = await supabase
    .from('roster_full_view')
    .select('*')
    .eq('pool_id', pool_id);
  console.log(pool_data);
  if (pool_data?.length) {
    return (
      <>
        <div>You're already a member of this pool.</div>
        <Redirect to={pool_id ? `/pool/${pool_id}` : `/`} timeout={1000} />
      </>
    );
  }
  if (!user_id) {
    return <div>You must be logged in to join a pool.</div>;
  }

  return (
    <>
      <h1>Join Pool</h1>
      <p>Pool ID: {pool_id}</p>
      <JoinButton pool_id={pool_id} user_id={user_id} />
    </>
  );
}
