import React from 'react';
import dayjs from 'dayjs';
import { Tag, Typography } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';

import type {
  ProjectsActivity,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
} from './types';

export { formatDateTime } from '../documents/format';

export const formatDate = (value: string | null | undefined) =>
  value ? dayjs(Number(value)).format(Formats.DATE_FORMAT) : '';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: 'Planned',
  active: 'Active',
  'on-hold': 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  planned: 'default',
  active: 'processing',
  'on-hold': 'orange',
  completed: 'green',
  cancelled: 'default',
};

export const ProjectStatusTag = ({ status }: { status: ProjectStatus }) => (
  <Tag color={PROJECT_STATUS_COLORS[status]}>{PROJECT_STATUS_LABELS[status]}</Tag>
);

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  blocked: 'Blocked',
  done: 'Done',
  cancelled: 'Cancelled',
};

const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'default',
  'in-progress': 'processing',
  blocked: 'red',
  done: 'green',
  cancelled: 'default',
};

export const TaskStatusTag = ({ status }: { status: TaskStatus }) => (
  <Tag color={TASK_STATUS_COLORS[status]}>{TASK_STATUS_LABELS[status]}</Tag>
);

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'default',
  normal: 'blue',
  high: 'orange',
  urgent: 'red',
};

export const PriorityTag = ({ priority }: { priority: TaskPriority }) => (
  <Tag color={PRIORITY_COLORS[priority]}>{PRIORITY_LABELS[priority]}</Tag>
);

/** A due or target date, in red when overdue. */
export const DueDate = ({
  value,
  overdue,
}: {
  value: string | null;
  overdue: boolean;
}) =>
  value ? (
    <Typography.Text type={overdue ? 'danger' : undefined}>
      {formatDate(value)}
      {overdue ? ' (overdue)' : ''}
    </Typography.Text>
  ) : (
    <Typography.Text type="secondary">No due date</Typography.Text>
  );

const ACTIONS: Record<string, string> = {
  'project-created': 'created the project',
  'project-updated': 'edited the project',
  'project-status-changed': 'changed the project status',
  'participants-added': 'added participants',
  'participant-removed': 'removed a participant',
  'project-deleted': 'deleted the project',
  'task-created': 'created a task',
  'task-updated': 'edited a task',
  'task-assigned': 'changed the assignee of a task',
  'task-status-changed': 'changed the status of a task',
  'task-progress-changed': 'updated the progress of a task',
  'task-moved': 'moved a task',
  'task-deleted': 'deleted a task',
  'comment-added': 'commented on a task',
  'comment-deleted': 'deleted a comment',
};

export const describeActivity = (entry: ProjectsActivity) => {
  const text = ACTIONS[entry.action] ?? entry.action;
  const { title, from, to } = entry.details;
  if (
    (entry.action === 'task-status-changed' ||
      entry.action === 'project-status-changed') &&
    typeof from === 'string' &&
    typeof to === 'string'
  ) {
    return `${text}: ${from} → ${to}`;
  }
  if (entry.action === 'task-progress-changed') {
    return `${text}: ${String(from)}% → ${String(to)}%`;
  }
  if (typeof title === 'string') return `${text} "${title}"`;
  return text;
};
