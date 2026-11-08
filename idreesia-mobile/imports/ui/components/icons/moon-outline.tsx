import React, { type SVGProps } from 'react';

/**
 * Crescent moon icon for the Night Stay Report. antd-mobile-icons has none,
 * so this follows its conventions: 48×48 grid, 1em size, 3px outline,
 * currentColor, and the `antd-mobile-icon` class so antd-mobile components
 * size it like theirs.
 */
export const MoonOutline = ({ className, style, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden
    height="1em"
    viewBox="0 0 48 48"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
    className={['antd-mobile-icon', className].filter(Boolean).join(' ')}
    style={{ verticalAlign: '-0.125em', ...style }}
  >
    <path
      d="M40 29.5 A17 17 0 1 1 18.5 8 A14 14 0 0 0 40 29.5 Z"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
    />
  </svg>
);
