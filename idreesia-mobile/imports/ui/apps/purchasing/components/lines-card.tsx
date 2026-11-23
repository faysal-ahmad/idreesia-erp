import React, { type ReactNode } from 'react';

export interface LineRow {
  key: string;
  title: ReactNode;
  /** Quantity and price, one short line. */
  detail?: ReactNode;
  /** The line total, on the right. */
  amount?: ReactNode;
}

/** A document's lines as compact rows: what, how many, and the amount. */
export const LinesCard = ({ title, rows }: { title: string; rows: LineRow[] }) => {
  if (rows.length === 0) return null;
  return (
    <section className="purchasing-section">
      <h3 className="purchasing-section-title">{title}</h3>
      <ul className="purchasing-lines">
        {rows.map(row => (
          <li key={row.key} className="purchasing-line">
            <div className="purchasing-line-main">
              <div className="purchasing-line-title">{row.title}</div>
              {row.detail && <div className="purchasing-line-detail">{row.detail}</div>}
            </div>
            {row.amount != null && row.amount !== '' && (
              <div className="purchasing-line-amount">{row.amount}</div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
