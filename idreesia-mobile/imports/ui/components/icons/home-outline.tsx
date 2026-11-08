import React, { type SVGProps } from 'react';

/**
 * House icon for the Home tab. antd-mobile-icons has none, so this follows
 * its conventions: 48×48 grid, 1em size, 3px outline, currentColor, and the
 * `antd-mobile-icon` class so antd-mobile components size it like theirs.
 */
export const HomeOutline = ({ className, style, ...props }: SVGProps<SVGSVGElement>) => (
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
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
    >
      {/* Roof */}
      <path d="M5.5 22 L24 6.5 L42.5 22" />
      {/* Walls */}
      <path d="M10.5 18 V38.5 a3 3 0 0 0 3 3 H34.5 a3 3 0 0 0 3 -3 V18" />
      {/* Door */}
      <path d="M19.5 41.5 V32 a2.5 2.5 0 0 1 2.5 -2.5 H26 a2.5 2.5 0 0 1 2.5 2.5 V41.5" />
    </g>
  </svg>
);
