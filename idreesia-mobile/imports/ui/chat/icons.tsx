import React, { type ReactNode } from 'react';

// Outline icons antd-mobile-icons doesn't have (its SendOutline isn't a paper
// plane), drawn to match it: 1em, currentColor, rounded 2px strokes.

const OutlineIcon = ({ children }: { children: ReactNode }) => (
  <svg
    aria-hidden="true"
    fill="none"
    height="1em"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
    width="1em"
  >
    {children}
  </svg>
);

/** Paperclip, for attaching files. */
export const AttachmentIcon = () => (
  <OutlineIcon>
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </OutlineIcon>
);

/** Paper plane, for sending a message. */
export const SendIcon = () => (
  <OutlineIcon>
    <path d="M22 2L11 13" />
    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
  </OutlineIcon>
);
