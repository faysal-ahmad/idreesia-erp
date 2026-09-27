import React, { type ReactNode, useEffect, useLayoutEffect, useRef } from 'react';

interface Props {
  /** Whether this screen is the one on show. */
  active: boolean;
  children: ReactNode;
}

/**
 * Keeps a screen mounted (but hidden) while the user looks at a screen
 * pushed on top of it, e.g. a list while its detail screen is open. Going
 * back then shows the list exactly as it was (search, loaded pages, scroll
 * position) instead of starting it again. Render it only while the screen
 * is still in the user's back stack.
 */
export const KeepAlive = ({ active, children }: Props) => {
  // The page scrolls the window, so the position is saved while on show and
  // put back when the screen returns. The screen pushed on top starts at the top.
  const scrollY = useRef(0);
  const firstRender = useRef(true);

  useEffect(() => {
    if (!active) return undefined;
    const onScroll = () => {
      scrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [active]);

  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, active ? scrollY.current : 0);
  }, [active]);

  return (
    <div className="keep-alive" hidden={!active}>
      {children}
    </div>
  );
};
