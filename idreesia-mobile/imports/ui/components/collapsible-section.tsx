import React, { type ReactNode, useState } from 'react';
import { List } from 'antd-mobile';
import { DownOutline, UpOutline } from 'antd-mobile-icons';

interface Props {
  title: string;
  /** Shown in the heading while the section is collapsed. */
  count: number;
  children: ReactNode;
}

/** A card list under a banner heading; tap the heading to collapse it. */
export const CollapsibleSection = ({ title, count, children }: Props) => {
  const [open, setOpen] = useState(true);
  return (
    <section className="collapsible-section">
      <button
        aria-expanded={open}
        className="collapsible-section-header"
        type="button"
        onClick={() => setOpen(!open)}
      >
        <span className="collapsible-section-title">{title}</span>
        {!open && <span className="collapsible-section-count">{count}</span>}
        {open ? <UpOutline /> : <DownOutline />}
      </button>
      {open && <List mode="card">{children}</List>}
    </section>
  );
};
