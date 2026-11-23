import React, { type ReactNode } from 'react';

export interface Field {
  label: string;
  value?: ReactNode;
  /** Bold, for totals. */
  strong?: boolean;
}

/** Compact label / value rows in one card. Empty values are left out. */
export const DetailFields = ({ fields }: { fields: Field[] }) => {
  const shown = fields.filter(field => field.value != null && field.value !== '' && field.value !== false);
  if (shown.length === 0) return null;

  return (
    <dl className="purchasing-fields">
      {shown.map(field => (
        <div
          key={field.label}
          className={field.strong ? 'purchasing-field purchasing-field-strong' : 'purchasing-field'}
        >
          <dt>{field.label}</dt>
          <dd>{field.value}</dd>
        </div>
      ))}
    </dl>
  );
};

interface SummaryProps {
  title: ReactNode;
  /** The document number, small, above the title. */
  eyebrow?: ReactNode;
  /** Status tag or similar, right of the eyebrow. */
  tag?: ReactNode;
  /** The headline amount. */
  amount?: ReactNode;
}

/** The card at the top of a document: number and status, title and the main amount. */
export const DetailSummary = ({ title, eyebrow, tag, amount }: SummaryProps) => (
  <section className="purchasing-summary">
    <div className="purchasing-summary-top">
      <span className="purchasing-summary-eyebrow">{eyebrow}</span>
      {tag}
    </div>
    <h2 className="purchasing-summary-title">{title}</h2>
    {amount != null && amount !== '' && <div className="purchasing-summary-amount">{amount}</div>}
  </section>
);
