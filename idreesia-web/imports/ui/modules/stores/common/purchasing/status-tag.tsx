import React from 'react';
import { Tag } from 'antd';

const COLORS: Record<string, string> = {
  draft: 'default',
  submitted: 'processing',
  approved: 'success',
  rejected: 'error',
  ordered: 'purple',
  closed: 'default',
  cancelled: 'default',
  sent: 'blue',
  'partially-received': 'warning',
  received: 'success',
  posted: 'success',
  voided: 'default',
};

const LABELS: Record<string, string> = {
  'partially-received': 'Partially Received',
};

export const statusDisplayName = (status: string) =>
  LABELS[status] ?? status.charAt(0).toUpperCase() + status.slice(1);

export const statusOptions = (statuses: string[]) =>
  statuses.map(status => ({ value: status, label: statusDisplayName(status) }));

interface Props {
  status?: string | null;
}

/** The status of a requisition, order or receipt a store works with. */
const StatusTag = ({ status }: Props) =>
  status ? (
    <Tag color={COLORS[status] ?? 'default'}>{statusDisplayName(status)}</Tag>
  ) : null;

export default StatusTag;
