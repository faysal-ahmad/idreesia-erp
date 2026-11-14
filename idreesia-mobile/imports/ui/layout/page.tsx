import React, { type ReactNode, useLayoutEffect, useRef } from 'react';
import { NavBar, PullToRefresh } from 'antd-mobile';

import { useNavigateBack } from './navigation';
import { useSwipeBack } from './use-swipe-back';

interface Props {
  title: ReactNode;
  /**
   * Parent route. When set, the nav bar shows a back arrow that returns here,
   * and swiping right from the left edge of the screen does the same.
   */
  backTo?: string;
  /** Nav bar actions on the right (icons or short text). */
  right?: ReactNode;
  /** Pinned to the bottom of the screen; for the page's primary action. */
  footer?: ReactNode;
  /** Makes the body pull-to-refresh. Leave it out where a list inside does that itself. */
  onRefresh?: () => Promise<unknown>;
  children: ReactNode;
}

/**
 * Shell for every signed-in screen: themed nav bar, scrolling body and an
 * optional pinned footer. See docs/mobile-ui-design-guidelines.md.
 */
export const Page = ({ title, backTo, right, footer, onRefresh, children }: Props) => {
  const navigateBack = useNavigateBack(backTo ?? '/');
  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  useSwipeBack(pageRef, navigateBack, Boolean(backTo));

  // iOS WebKit can keep painting the sticky header at the scroll offset of the
  // screen this one replaced (e.g. a short detail screen opened from a
  // scrolled list, kept alive underneath), leaving the nav bar and its back
  // arrow off screen until the next scroll. Laying the header out again once
  // after mount makes WebKit recompute its position.
  useLayoutEffect(() => {
    const relayout = () => {
      const header = headerRef.current;
      if (!header) return;
      header.style.position = 'relative';
      // Reading a layout property forces the relayout before restoring.
      header.getBoundingClientRect();
      header.style.position = '';
    };
    // Once right after mount, and again shortly after: the screen underneath
    // is hidden and the scroll position reset a moment after this one mounts.
    const frame = requestAnimationFrame(relayout);
    const timers = [100, 300].map(delay => setTimeout(relayout, delay));
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div ref={pageRef} className="page">
      {/* The header, not the NavBar, clears the status bar / Dynamic Island:
          antd-mobile's own NavBar padding would override ours. */}
      <header ref={headerRef} className="page-header">
        <NavBar back={backTo ? '' : null} className="page-nav-bar" right={right} onBack={navigateBack}>
          {title}
        </NavBar>
      </header>
      <main className="page-body">
        {onRefresh ? (
          <PullToRefresh onRefresh={() => onRefresh().then(() => undefined, () => undefined)}>
            {children}
          </PullToRefresh>
        ) : (
          children
        )}
      </main>
      {footer && <div className="page-footer">{footer}</div>}
    </div>
  );
};
