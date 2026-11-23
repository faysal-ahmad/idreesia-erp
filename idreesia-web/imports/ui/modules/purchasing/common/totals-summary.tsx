import React from 'react';

import { formatMoney } from './format';

interface TotalsSummaryProps {
  subtotal: number;
  taxTotal?: number;
  discount?: number;
  shipping?: number;
  total: number;
}

/** The totals under a document's lines. */
const TotalsSummary = ({ subtotal, taxTotal, discount, shipping, total }: TotalsSummaryProps) => (
  <div className="purchasing-totals">
    <div><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
    {taxTotal ? <div><span>Tax</span><span>{formatMoney(taxTotal)}</span></div> : null}
    {discount ? <div><span>Discount</span><span>-{formatMoney(discount)}</span></div> : null}
    {shipping ? <div><span>Shipping</span><span>{formatMoney(shipping)}</span></div> : null}
    <div className="purchasing-totals-total"><span>Total</span><span>{formatMoney(total)}</span></div>
  </div>
);

export default TotalsSummary;
