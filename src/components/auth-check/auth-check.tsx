'use client';
import { Redirect } from '@components/redirect/redirect';
import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
const PERMITTED_ROUTES = ['', '/login', '/signup', '/', '/logout'];

interface AuthCheckProps {
  user_id: string | undefined;
}
const SuspenselessAuthCheck: React.FC<AuthCheckProps> = ({ user_id }) => {
  const pathname = usePathname();
  console.log('::: inside auth check:: pathname', pathname);
  console.log(PERMITTED_ROUTES.includes(pathname));
  if (!user_id && !PERMITTED_ROUTES.includes(pathname)) {
    return (
      <>
        <Redirect to="/login" />
      </>
    );
  }
  return <></>;
};

export const AuthCheck: React.FC<AuthCheckProps> = ({ user_id }) => {
  return (
    <>
      <Suspense fallback={<></>}>
        <SuspenselessAuthCheck user_id={user_id} />
      </Suspense>
    </>
  );
};
