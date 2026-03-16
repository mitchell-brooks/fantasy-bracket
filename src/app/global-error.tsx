// ABOUTME: Global error boundary that catches errors in the root layout
// ABOUTME: Renders a full HTML page with a retry button since the root layout has failed
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html>
      <head></head>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
