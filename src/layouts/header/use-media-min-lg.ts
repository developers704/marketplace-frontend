'use client';

import { useLayoutEffect, useState } from 'react';

const QUERY = '(min-width: 1024px)';

/** True when viewport is Tailwind `lg` and up — used to swap mobile nav vs category mega menu. */
export function useMediaMinLg(): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(QUERY).matches : false,
  );

  useLayoutEffect(() => {
    const mq = window.matchMedia(QUERY);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return matches;
}
