import React, { type ReactNode, useState } from 'react';
import { InformationCircleOutline } from 'antd-mobile-icons';

interface Props {
  children: ReactNode;
}

/** A hint with an info icon: one line until tapped, which shows all of it (and tapping again folds it back). */
export const InfoNote = ({ children }: Props) => {
  const [open, setOpen] = useState(false);
  return (
    <button aria-expanded={open} className="da-info-note" type="button" onClick={() => setOpen(current => !current)}>
      <InformationCircleOutline className="da-info-note-icon" />
      <span className={open ? 'da-info-note-text' : 'da-info-note-text da-info-note-clamped'}>{children}</span>
    </button>
  );
};
