import React, { type ReactNode } from 'react';
import { NavBar } from 'antd-mobile';

import { useNavigateBack } from './navigation';

interface Props {
  title: ReactNode;
  /** Parent route. When set, the nav bar shows a back arrow that returns here. */
  backTo?: string;
  /** Nav bar actions on the right (icons or short text). */
  right?: ReactNode;
  /** Pinned to the bottom of the screen; for the page's primary action. */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Shell for every signed-in screen: themed nav bar, scrolling body and an
 * optional pinned footer. See docs/mobile-ui-design-guidelines.md.
 */
export const Page = ({ title, backTo, right, footer, children }: Props) => {
  const navigateBack = useNavigateBack(backTo ?? '/');

  return (
    <div className="page">
      <NavBar back={backTo ? '' : null} className="page-nav-bar" right={right} onBack={navigateBack}>
        {title}
      </NavBar>
      <main className="page-body">{children}</main>
      {footer && <div className="page-footer">{footer}</div>}
    </div>
  );
};
