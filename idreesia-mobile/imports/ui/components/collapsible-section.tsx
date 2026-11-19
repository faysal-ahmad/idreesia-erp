import React, { type ReactNode, useState } from 'react';
import { Badge, List } from 'antd-mobile';
import { DownOutline, UpOutline } from 'antd-mobile-icons';

interface Props {
  title: string;
  /** Shown in the heading while the section is collapsed; omit for none. */
  count?: number;
  /** Show the count as a red notification badge instead of a plain pill. */
  alert?: boolean;
  children: ReactNode;
}

/** A card list under a banner heading; tap the heading to collapse it. */
export const CollapsibleSection = ({ title, count, alert, children }: Props) => {
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
        {!open &&
          count !== undefined &&
          (alert ? (
            <Badge className="workspaces-badge" content={count} />
          ) : (
            <span className="collapsible-section-count">{count}</span>
          ))}
        {open ? <UpOutline /> : <DownOutline />}
      </button>
      {open && <List mode="card">{children}</List>}
    </section>
  );
};
