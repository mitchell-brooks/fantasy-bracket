import { useSyncExternalStore } from 'react';

function onWindowSizeChange(onChange: () => void) {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

function windowWidthSnapshot(selector = (w: number) => w) {
  return selector(window.innerWidth);
}

function windowHeightSnapshot(selector = (h: number) => h) {
  return selector(window.innerHeight);
}

type UseWindowSize = {
  widthSelector?: (w: number) => number;
  heightSelector?: (h: number) => number;
};

export function useWindowSize({
  widthSelector = (w: number) => w,
  heightSelector = (h: number) => h,
}: UseWindowSize) {
  const windowWidth = useSyncExternalStore(
    onWindowSizeChange,
    () => windowWidthSnapshot(widthSelector),
    () => 0
  );

  const windowHeight = useSyncExternalStore(
    onWindowSizeChange,
    () => windowHeightSnapshot(heightSelector),
    () => 0
  );

  return { width: windowWidth, height: windowHeight };
}
