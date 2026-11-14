// Display formats and labels for projects and tasks, matching the web's UI.
// Dates come from the API as epoch milliseconds in a string.
import { formatDateTime, formatDay, formatRelative, toDate } from '../polls/format';

export { formatDateTime, formatDay, formatRelative, toDate };

type TagColor = 'default' | 'primary' | 'success' | 'warning' | 'danger';
interface Labelled {
  label: string;
  color: TagColor;
}

export const PROJECT_STATUSES: Record<string, Labelled> = {
  planned: { label: 'Planned', color: 'default' },
  active: { label: 'Active', color: 'primary' },
  'on-hold': { label: 'On hold', color: 'warning' },
  completed: { label: 'Completed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'default' },
};

export const TASK_STATUSES: Record<string, Labelled> = {
  todo: { label: 'To do', color: 'default' },
  'in-progress': { label: 'In progress', color: 'primary' },
  blocked: { label: 'Blocked', color: 'warning' },
  done: { label: 'Done', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'default' },
};

export const TASK_PRIORITIES: Record<string, Labelled> = {
  low: { label: 'Low', color: 'default' },
  normal: { label: 'Normal', color: 'default' },
  high: { label: 'High', color: 'warning' },
  urgent: { label: 'Urgent', color: 'danger' },
};

const fallback = (value?: string | null): Labelled => ({ label: value ?? '', color: 'default' });

export const projectStatus = (status?: string | null) => PROJECT_STATUSES[status ?? ''] ?? fallback(status);
export const taskStatus = (status?: string | null) => TASK_STATUSES[status ?? ''] ?? fallback(status);
export const taskPriority = (priority?: string | null) => TASK_PRIORITIES[priority ?? ''] ?? fallback(priority);

/** Project states in which the project and its tasks can still change. */
export const isProjectOpen = (status?: string | null) =>
  status === 'planned' || status === 'active' || status === 'on-hold';

/** Task states that still need work. */
export const isTaskOpen = (status?: string | null) =>
  status === 'todo' || status === 'in-progress' || status === 'blocked';

/** "Due 12-11-2026" / "Overdue since 12-11-2026" for a task row. */
export const describeDue = (task: { dueDate?: string | null; isOverdue?: boolean | null; status?: string | null }) => {
  const date = toDate(task.dueDate);
  if (!date) return 'No due date';
  if (task.isOverdue) return `Overdue since ${formatDay(date)}`;
  return `Due ${formatDay(date)}`;
};

/** The end of a calendar day, as epoch milliseconds in a string: a due date is the whole day. */
export const endOfDay = (date: Date) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 0);
  return String(end.getTime());
};

/** What an activity entry did, e.g. "assigned the task" (as on the web). */
export const describeActivity = (action: string, details: Record<string, unknown>) => {
  const title = typeof details.title === 'string' ? ` "${details.title}"` : '';
  switch (action) {
    case 'project-created':
      return `created the project${title}`;
    case 'project-updated':
      return 'edited the project';
    case 'project-status-changed':
      return `changed the project status${details.to ? ` to ${projectStatus(String(details.to)).label.toLowerCase()}` : ''}`;
    case 'participants-added':
      return Array.isArray(details.participantIds)
        ? `added participants (${details.participantIds.length})`
        : 'added participants';
    case 'participant-removed':
      return 'removed a participant';
    case 'project-deleted':
      return `deleted the project${title}`;
    case 'task-created':
      return `created the task${title}`;
    case 'task-updated':
      return 'edited a task';
    case 'task-assigned':
      return 'changed a task’s assignee';
    case 'task-status-changed':
      return `changed a task’s status${details.to ? ` to ${taskStatus(String(details.to)).label.toLowerCase()}` : ''}`;
    case 'task-progress-changed':
      return `set a task’s progress${typeof details.to === 'number' ? ` to ${details.to}%` : ''}`;
    case 'task-moved':
      return 'moved a task';
    case 'task-deleted':
      return `deleted the task${title}`;
    case 'comment-added':
      return 'commented on a task';
    case 'comment-deleted':
      return 'deleted a comment';
    default:
      return action.replace(/-/g, ' ');
  }
};
