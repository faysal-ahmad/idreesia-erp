import React from 'react';
import { Tag } from 'antd';

const COLORS: Record<string, string> = {
  draft: 'default',
  submitted: 'processing',
  'pending-approval': 'processing',
  approved: 'success',
  rejected: 'error',
  ordered: 'purple',
  cancelled: 'default',
  received: 'success',
  selected: 'success',
  sent: 'blue',
  'partially-received': 'warning',
  closed: 'default',
  posted: 'success',
  voided: 'default',
  unpaid: 'warning',
  'partially-paid': 'processing',
  paid: 'success',
};

const LABELS: Record<string, string> = {
  'pending-approval': 'Pending Approval',
  'partially-received': 'Partially Received',
  'partially-paid': 'Partially Paid',
};

const label = (status: string) =>
  LABELS[status] ?? status.charAt(0).toUpperCase() + status.slice(1);

interface StatusTagProps {
  status?: string | null;
}

/**
 * The status of a purchasing document. A quote still waiting for a decision
 * is "received" too, which reads as "open".
 */
const StatusTag = ({ status }: StatusTagProps) =>
  status ? <Tag color={COLORS[status] ?? 'default'}>{label(status)}</Tag> : null;

export const statusDisplayName = label;

export const statusOptions = (statuses: string[]) =>
  statuses.map((status) => ({ value: status, label: label(status) }));

export default StatusTag;
