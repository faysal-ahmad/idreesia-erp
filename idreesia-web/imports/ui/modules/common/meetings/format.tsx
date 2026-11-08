import React from 'react';
import dayjs from 'dayjs';
import { Tag } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';

import type {
  ActionItemStatus,
  AttendanceStatus,
  MeetingActivity,
  MeetingStatus,
  ParticipantRole,
  RsvpStatus,
} from './types';

export {
  FileTypeIcon,
  formatDateTime,
  formatSize,
} from '../documents/format';

const toDayjs = (value: string) => dayjs(Number(value));

/** "Mon 12-11-2026, 04:00 pm - 05:30 pm" (end date shown if different). */
export const formatMeetingTime = (startsAt: string, endsAt: string) => {
  const start = toDayjs(startsAt);
  const end = toDayjs(endsAt);
  const date = `${start.format('ddd')} ${start.format(Formats.DATE_FORMAT)}`;
  const endText = end.isSame(start, 'day')
    ? end.format(Formats.TIME_FORMAT)
    : end.format(Formats.DATE_TIME_FORMAT);
  return `${date}, ${start.format(Formats.TIME_FORMAT)} - ${endText}`;
};

export const formatDate = (value: string | null | undefined) =>
  value ? toDayjs(value).format(Formats.DATE_FORMAT) : '';

/** Has started (now is past its start time). */
export const hasStarted = (startsAt: string) =>
  Number(startsAt) <= Date.now();

export const STATUS_LABELS: Record<MeetingStatus, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<MeetingStatus, string> = {
  scheduled: 'blue',
  completed: 'green',
  cancelled: 'default',
};

/** The meeting's status; a scheduled meeting under way shows "In progress". */
export const MeetingStatusTag = ({
  status,
  startsAt,
  endsAt,
}: {
  status: MeetingStatus;
  startsAt: string;
  endsAt: string;
}) => {
  const now = Date.now();
  if (status === 'scheduled' && Number(startsAt) <= now) {
    return Number(endsAt) > now ? (
      <Tag color="processing">In progress</Tag>
    ) : (
      <Tag color="orange">Awaiting completion</Tag>
    );
  }
  return <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>;
};

export const ROLE_LABELS: Record<ParticipantRole, string> = {
  organizer: 'Organizer',
  required: 'Required',
  optional: 'Optional',
};

export const RSVP_LABELS: Record<RsvpStatus, string> = {
  pending: 'No response',
  accepted: 'Accepted',
  declined: 'Declined',
  tentative: 'Tentative',
};

const RSVP_COLORS: Record<RsvpStatus, string> = {
  pending: 'default',
  accepted: 'green',
  declined: 'red',
  tentative: 'gold',
};

export const RsvpTag = ({ status }: { status: RsvpStatus }) => (
  <Tag color={RSVP_COLORS[status]}>{RSVP_LABELS[status]}</Tag>
);

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  excused: 'Excused',
};

export const ACTION_ITEM_STATUS_LABELS: Record<ActionItemStatus, string> = {
  open: 'Open',
  'in-progress': 'In progress',
  done: 'Done',
  cancelled: 'Cancelled',
};

const ACTION_ITEM_COLORS: Record<ActionItemStatus, string> = {
  open: 'blue',
  'in-progress': 'gold',
  done: 'green',
  cancelled: 'default',
};

export const ActionItemStatusTag = ({ status }: { status: ActionItemStatus }) => (
  <Tag color={ACTION_ITEM_COLORS[status]}>
    {ACTION_ITEM_STATUS_LABELS[status]}
  </Tag>
);

/** What an activity entry did, e.g. "rescheduled the meeting". */
export const describeActivity = ({ action, details }: MeetingActivity) => {
  const title = (key = 'title') =>
    details[key] ? ` "${String(details[key])}"` : '';
  switch (action) {
    case 'meeting-created':
      return 'scheduled the meeting';
    case 'meeting-updated':
      return 'edited the details';
    case 'meeting-rescheduled':
      return 'rescheduled the meeting';
    case 'meeting-cancelled':
      return details.reason
        ? `cancelled the meeting: ${String(details.reason)}`
        : 'cancelled the meeting';
    case 'meeting-reopened':
      return 'reopened the meeting';
    case 'meeting-completed':
      return 'marked the meeting completed';
    case 'participants-added':
      return 'invited participants';
    case 'participant-removed':
      return 'removed a participant';
    case 'participant-role-changed':
      return "changed a participant's role";
    case 'invitation-responded':
      return details.status
        ? `responded: ${RSVP_LABELS[details.status as RsvpStatus] ?? details.status}`
        : 'responded to the invitation';
    case 'attendance-marked':
      return 'recorded attendance';
    case 'agenda-item-added':
      return `added agenda item${title()}`;
    case 'agenda-item-updated':
      return 'edited an agenda item';
    case 'agenda-item-removed':
      return `removed agenda item${title()}`;
    case 'agenda-reordered':
      return 'reordered the agenda';
    case 'minutes-updated':
      return details.cleared ? 'cleared the minutes' : 'updated the minutes';
    case 'attachment-added':
      return `attached${title('name')}`;
    case 'attachment-updated':
      return 'edited an attachment';
    case 'attachment-deleted':
      return `deleted attachment${title('name')}`;
    case 'attachment-downloaded':
      return 'downloaded an attachment';
    case 'action-item-created':
      return `added action item${title()}`;
    case 'action-item-updated':
      return 'edited an action item';
    case 'action-item-status-changed':
      return details.to
        ? `marked an action item ${ACTION_ITEM_STATUS_LABELS[details.to as ActionItemStatus] ?? details.to}`
        : 'changed an action item';
    case 'action-item-deleted':
      return `deleted action item${title()}`;
    default:
      return action.replace(/-/g, ' ');
  }
};

export const showError = (
  notify: (text: string) => void,
  error: unknown
) => notify(error instanceof Error ? error.message : String(error));
