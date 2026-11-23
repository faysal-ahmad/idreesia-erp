import type { TagProps } from 'antd-mobile';

export { formatDate, formatDateTime, formatSize, toDate } from '../../workspaces/meetings/format';

/** "1,250.00" for an amount; blank when there is none. */
export const formatMoney = (value: number | null | undefined) =>
  value == null
    ? ''
    : value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** A quantity without trailing zeros: 2.5, 10. */
export const formatQuantity = (value: number | null | undefined) =>
  value == null ? '' : value.toLocaleString(undefined, { maximumFractionDigits: 3 });

/** The string the server expects for a day picked in the UI: start of that day, in ms. */
export const toDateInput = (value: Date) =>
  String(new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime());

type TagColor = NonNullable<TagProps['color']>;

const STATUS_COLORS: Record<string, TagColor> = {
  draft: 'default',
  submitted: 'primary',
  'pending-approval': 'primary',
  approved: 'success',
  rejected: 'danger',
  ordered: 'primary',
  cancelled: 'default',
  received: 'success',
  sent: 'primary',
  'partially-received': 'warning',
  closed: 'default',
  posted: 'success',
  voided: 'default',
  unpaid: 'warning',
  'partially-paid': 'primary',
  paid: 'success',
};

const STATUS_LABELS: Record<string, string> = {
  'pending-approval': 'Pending approval',
  'partially-received': 'Partially received',
  'partially-paid': 'Partially paid',
  'bank-transfer': 'Bank transfer',
};

/** Sentence-case label for a status or payment method value. */
export const statusLabel = (status: string) =>
  STATUS_LABELS[status] ?? status.charAt(0).toUpperCase() + status.slice(1);

export const statusColor = (status: string): TagColor => STATUS_COLORS[status] ?? 'default';

export const REQUISITION_STATUSES = ['draft', 'submitted', 'approved', 'rejected', 'ordered', 'cancelled'];
export const ORDER_STATUSES = [
  'draft',
  'pending-approval',
  'approved',
  'sent',
  'partially-received',
  'received',
  'closed',
  'cancelled',
];
export const RECEIPT_STATUSES = ['posted', 'voided'];
export const INVOICE_STATUSES = ['unpaid', 'partially-paid', 'paid', 'voided'];
export const PAYMENT_STATUSES = ['posted', 'voided'];

/** The order states in which goods can be received. */
export const RECEIVABLE_ORDER_STATUSES = ['approved', 'sent', 'partially-received'];
