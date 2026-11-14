import React from 'react';
import dayjs from 'dayjs';
import { Tag } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';

import type { PollActivity, PollQuestion, PollStatus } from './types';

export { formatDateTime } from '../documents/format';

export const STATUS_LABELS: Record<PollStatus, string> = {
  draft: 'Draft',
  open: 'Open',
  closed: 'Closed',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<PollStatus, string> = {
  draft: 'default',
  open: 'processing',
  closed: 'green',
  cancelled: 'default',
};

export const PollStatusTag = ({ status }: { status: PollStatus }) => (
  <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>
);

/** "Mon 12-11-2026 04:00 pm" */
export const formatPollTime = (value: string | null | undefined) =>
  value
    ? `${dayjs(Number(value)).format('ddd')} ${dayjs(Number(value)).format(Formats.DATE_TIME_FORMAT)}`
    : '';

/** "in 3 hours", "2 days ago". */
export const formatRelative = (value: string | null | undefined) => {
  if (!value) return '';
  const diff = Number(value) - Date.now();
  const abs = Math.abs(diff);
  const units: Array<[number, string]> = [
    [24 * 60 * 60 * 1000, 'day'],
    [60 * 60 * 1000, 'hour'],
    [60 * 1000, 'minute'],
  ];
  const [size, unit] = units.find(([ms]) => abs >= ms) ?? [60 * 1000, 'minute'];
  const count = Math.max(1, Math.round(abs / size));
  const text = `${count} ${unit}${count === 1 ? '' : 's'}`;
  return diff >= 0 ? `in ${text}` : `${text} ago`;
};

/** When the poll ends or ended, for lists and the header. */
export const describeClosing = (poll: {
  status: PollStatus;
  closesAt: string;
  closedAt: string | null;
}) => {
  switch (poll.status) {
    case 'open':
      return `Closes ${formatRelative(poll.closesAt)} (${formatPollTime(poll.closesAt)})`;
    case 'closed':
      return `Closed ${formatPollTime(poll.closedAt ?? poll.closesAt)}`;
    case 'draft':
      return `Set to close ${formatPollTime(poll.closesAt)}`;
    default:
      return '';
  }
};

/** "Choose one", "Choose 1 to 3", for a question's hint. */
export const choiceHint = (question: PollQuestion) => {
  if (question.type === 'single') return 'Choose one';
  const min = question.minChoices ?? 1;
  const max = question.maxChoices ?? question.options.length;
  if (min === max) return `Choose ${min}`;
  if (min <= 1 && max >= question.options.length) return 'Choose any';
  return `Choose ${min} to ${max}`;
};

const ACTIONS: Record<string, string> = {
  'poll-created': 'created the poll',
  'poll-updated': 'edited the poll',
  'questions-updated': 'changed the questions',
  'poll-opened': 'opened the poll for voting',
  'poll-closed': 'closed the poll',
  'poll-reopened': 'reopened the poll',
  'poll-cancelled': 'cancelled the poll',
  'poll-deleted': 'deleted the poll',
  'vote-cast': 'voted',
  'vote-changed': 'changed their vote',
  'vote-withdrawn': 'withdrew their vote',
};

export const describeActivity = (entry: PollActivity) => {
  const text = ACTIONS[entry.action] ?? entry.action;
  const { reason } = entry.details;
  if (entry.action === 'poll-cancelled' && typeof reason === 'string') {
    return `${text}: ${reason}`;
  }
  return text;
};
