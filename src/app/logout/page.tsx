import { createClient } from '@utils/supabase-server';
import React from 'react';
import { Redirect } from '@components/redirect/redirect';
import { Logout } from '@components/logout/logout';

export default async function LogoutPage() {
  return (
    <>
      <h2>You've been logged out.</h2>
      <Logout />
      <Redirect to="/" />
    </>
  );
}
