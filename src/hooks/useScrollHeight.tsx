import { useSyncExternalStore } from 'react';

function onWindowSizeChange(onChange: () => void) {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

function scrollHeightSnapshot(selector = (h: number) => h) {
  if (typeof document === 'undefined') return 0;
  return selector(document.body.scrollHeight);
}

export function useScrollHeight(selector: (h: number) => number) {
  return useSyncExternalStore(
    onWindowSizeChange,
    () => scrollHeightSnapshot(selector),
    () => 0
  );
}
