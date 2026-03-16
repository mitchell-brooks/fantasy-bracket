// ABOUTME: Client-side redirect component with optional delay for timed redirects
// ABOUTME: Wraps Next.js router.push in a Suspense boundary to handle navigation state
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect } from 'react';

interface RedirectProps {
  to?: string;
  timeout?: number;
}
const SuspenselessRedirect: React.FC<RedirectProps> = ({
  to = '/',
  timeout = 0,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // console.log('searchParams', searchParams);
  if (to === '/login') {
    to = `${to}?return_to=${pathname}`;
  }
  useEffect(() => {
    let delay: NodeJS.Timeout | undefined;
    if (timeout) {
      delay = setTimeout(() => {
        router.push(to);
      }, timeout);
    } else {
      router.push(to);
    }
    return () => clearTimeout(delay);
  }, []);
  return <></>;
};

const RedirectFallback = () => {
  return <></>;
};
export const Redirect: React.FC<RedirectProps> = ({ to, timeout }) => {
  return (
    <>
      <Suspense fallback={<RedirectFallback />}>
        <SuspenselessRedirect to={to} timeout={timeout} />
      </Suspense>
    </>
  );
};
