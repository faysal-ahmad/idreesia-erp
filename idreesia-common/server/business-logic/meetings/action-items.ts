import {
  MeetingActionItemStatus,
  MeetingsAction,
  MeetingsEntityType,
  OPEN_ACTION_ITEM_STATUSES,
  type MeetingActionItemStatusValue,
} from 'meteor/idreesia-common/constants/meetings';
import {
  MeetingActionItems,
  Meetings,
  type MeetingActionItemDocument,
  type MeetingDocument,
} from 'meteor/idreesia-common/server/collections/meetings';

import { logActivity } from './activity';
import { meetingsError } from './errors';
import {
  assertStatus,
  EDITABLE_STATUSES,
  normalizeOpaqueId,
  normalizePage,
  normalizeText,
  normalizeTitle,
  requireMeeting,
  requireOneOf,
  requireUserId,
  requireWorkspace,
  toDate,
  type MeetingsPage,
  type MeetingsPageOptions,
} from './internal';

const isOpen = (status: MeetingActionItemStatusValue) =>
  OPEN_ACTION_ITEM_STATUSES.includes(status);

const changeOpenCount = (meetingId: string, by: number) =>
  by
    ? Meetings.updateAsync(meetingId, { $inc: { openActionItemCount: by } })
    : Promise.resolve(0);

/** A meeting that can take new or changed action items (not cancelled). */
async function requireEditableMeeting(meetingId: string) {
  const meeting = await requireMeeting(meetingId);
  assertStatus(meeting, EDITABLE_STATUSES);
  return meeting;
}

/** An action item whose meeting is in a live workspace. */
async function requireActionItem(
  actionItemId: string
): Promise<MeetingActionItemDocument> {
  const item = actionItemId
    ? await MeetingActionItems.findOneAsync(actionItemId)
    : undefined;
  if (!item) throw meetingsError('NOT_FOUND', 'Action item not found');
  await requireMeeting(item.meetingId).catch(() => {
    throw meetingsError('NOT_FOUND', 'Action item not found');
  });
  return item;
}

function requireAgendaItem(meeting: MeetingDocument, agendaItemId: string) {
  if (!meeting.agenda.some(({ _id }) => _id === agendaItemId)) {
    throw meetingsError('NOT_FOUND', 'Agenda item not found');
  }
  return agendaItemId;
}

const optionalId = (value: unknown, what: string) =>
  value === undefined || value === null || value === ''
    ? undefined
    : normalizeOpaqueId(value, what);

export interface CreateActionItemInput {
  meetingId: string;
  title: string;
  description?: string;
  /** Opaque id of whoever should do it (e.g. a participant id). */
  assigneeId?: string;
  dueDate?: Date | string;
  /** An agenda item of the same meeting. */
  agendaItemId?: string;
}

export async function createActionItem(
  input: CreateActionItemInput,
  userId: string
): Promise<MeetingActionItemDocument> {
  requireUserId(userId);
  const meeting = await requireEditableMeeting(input.meetingId);
  const title = normalizeTitle(input.title, 'Action item title');
  const description = normalizeText(input.description, 'Description');
  const assigneeId = optionalId(input.assigneeId, 'Assignee id');
  const dueDate =
    input.dueDate !== undefined && input.dueDate !== null
      ? toDate(input.dueDate, 'Due date')
      : undefined;
  const agendaItemId = input.agendaItemId
    ? requireAgendaItem(meeting, input.agendaItemId)
    : undefined;

  const date = new Date();
  const actionItemId = await MeetingActionItems.insertAsync({
    workspaceId: meeting.workspaceId,
    meetingId: meeting._id,
    ...(agendaItemId ? { agendaItemId } : {}),
    title,
    ...(description ? { description } : {}),
    ...(assigneeId ? { assigneeId } : {}),
    ...(dueDate ? { dueDate } : {}),
    status: MeetingActionItemStatus.OPEN,
    createdAt: date,
    createdBy: userId,
    updatedAt: date,
    updatedBy: userId,
  });
  await changeOpenCount(meeting._id, 1);
  await logActivity({
    workspaceId: meeting.workspaceId,
    meetingId: meeting._id,
    entityType: MeetingsEntityType.ACTION_ITEM,
    entityId: actionItemId,
    action: MeetingsAction.ACTION_ITEM_CREATED,
    userId,
    details: { title, ...(assigneeId ? { assigneeId } : {}) },
  });
  return requireActionItem(actionItemId);
}

export async function getActionItem(
  actionItemId: string,
  userId: string
): Promise<MeetingActionItemDocument> {
  requireUserId(userId);
  return requireActionItem(actionItemId);
}

export interface UpdateActionItemInput {
  title?: string;
  /** null clears it. */
  description?: string | null;
  /** null clears it. */
  assigneeId?: string | null;
  /** null clears it. */
  dueDate?: Date | string | null;
  /** null clears it. */
  agendaItemId?: string | null;
}

export async function updateActionItem(
  actionItemId: string,
  changes: UpdateActionItemInput,
  userId: string
): Promise<MeetingActionItemDocument> {
  requireUserId(userId);
  const item = await requireActionItem(actionItemId);
  const meeting = await requireEditableMeeting(item.meetingId);

  const $set: Record<string, unknown> = {
    updatedAt: new Date(),
    updatedBy: userId,
  };
  const $unset: Record<string, 1> = {};
  const setOrUnset = (field: string, value: unknown) => {
    if (value) $set[field] = value;
    else $unset[field] = 1;
  };

  if (changes.title !== undefined) {
    $set.title = normalizeTitle(changes.title, 'Action item title');
  }
  if (changes.description !== undefined) {
    setOrUnset(
      'description',
      normalizeText(changes.description, 'Description')
    );
  }
  if (changes.assigneeId !== undefined) {
    setOrUnset('assigneeId', optionalId(changes.assigneeId, 'Assignee id'));
  }
  if (changes.dueDate !== undefined) {
    setOrUnset(
      'dueDate',
      changes.dueDate === null ? undefined : toDate(changes.dueDate, 'Due date')
    );
  }
  if (changes.agendaItemId !== undefined) {
    setOrUnset(
      'agendaItemId',
      changes.agendaItemId
        ? requireAgendaItem(meeting, changes.agendaItemId)
        : undefined
    );
  }

  await MeetingActionItems.updateAsync(actionItemId, {
    $set,
    ...(Object.keys($unset).length ? { $unset } : {}),
  });
  await logActivity({
    workspaceId: item.workspaceId,
    meetingId: item.meetingId,
    entityType: MeetingsEntityType.ACTION_ITEM,
    entityId: actionItemId,
    action: MeetingsAction.ACTION_ITEM_UPDATED,
    userId,
    details: { changed: Object.keys(changes) },
  });
  return requireActionItem(actionItemId);
}

/**
 * Moves an action item to another status. Done records who completed it
 * and when; any other status clears that.
 */
export async function setActionItemStatus(
  actionItemId: string,
  status: MeetingActionItemStatusValue,
  userId: string
): Promise<MeetingActionItemDocument> {
  requireUserId(userId);
  const newStatus = requireOneOf(status, MeetingActionItemStatus, 'Status');
  const item = await requireActionItem(actionItemId);
  await requireEditableMeeting(item.meetingId);
  if (item.status === newStatus) return item;

  const date = new Date();
  const isDone = newStatus === MeetingActionItemStatus.DONE;
  // Matching the old status keeps the meeting's open count right when two
  // requests change the same item at once.
  const updated = await MeetingActionItems.updateAsync(
    { _id: actionItemId, status: item.status },
    {
      $set: {
        status: newStatus,
        ...(isDone ? { completedAt: date, completedBy: userId } : {}),
        updatedAt: date,
        updatedBy: userId,
      },
      ...(isDone ? {} : { $unset: { completedAt: 1, completedBy: 1 } }),
    }
  );
  if (!updated) {
    throw meetingsError(
      'CONFLICT',
      'The action item was changed by another request; reload and try again'
    );
  }
  await changeOpenCount(
    item.meetingId,
    Number(isOpen(newStatus)) - Number(isOpen(item.status))
  );
  await logActivity({
    workspaceId: item.workspaceId,
    meetingId: item.meetingId,
    entityType: MeetingsEntityType.ACTION_ITEM,
    entityId: actionItemId,
    action: MeetingsAction.ACTION_ITEM_STATUS_CHANGED,
    userId,
    details: { from: item.status, to: newStatus },
  });
  return requireActionItem(actionItemId);
}

export async function deleteActionItem(
  actionItemId: string,
  userId: string
): Promise<void> {
  requireUserId(userId);
  const item = await requireActionItem(actionItemId);
  await requireEditableMeeting(item.meetingId);

  const removed = await MeetingActionItems.removeAsync({
    _id: actionItemId,
    status: item.status,
  });
  if (!removed) {
    throw meetingsError(
      'CONFLICT',
      'The action item was changed by another request; reload and try again'
    );
  }
  await changeOpenCount(item.meetingId, -Number(isOpen(item.status)));
  await logActivity({
    workspaceId: item.workspaceId,
    meetingId: item.meetingId,
    entityType: MeetingsEntityType.ACTION_ITEM,
    entityId: actionItemId,
    action: MeetingsAction.ACTION_ITEM_DELETED,
    userId,
    details: { title: item.title },
  });
}

export interface ListActionItemsOptions extends MeetingsPageOptions {
  meetingId?: string;
  assigneeId?: string;
  status?: MeetingActionItemStatusValue | MeetingActionItemStatusValue[];
  /** Only items due before this time. */
  dueBefore?: Date;
}

/** A workspace's action items, soonest due first (undated ones first). */
export async function listActionItems(
  workspaceId: string,
  userId: string,
  { meetingId, assigneeId, status, dueBefore, ...page }: ListActionItemsOptions = {}
): Promise<MeetingsPage<MeetingActionItemDocument>> {
  requireUserId(userId);
  await requireWorkspace(workspaceId);
  const { skip, limit } = normalizePage(page);

  const selector: Record<string, unknown> = { workspaceId };
  if (meetingId) selector.meetingId = meetingId;
  if (assigneeId) selector.assigneeId = assigneeId;
  if (status !== undefined) {
    const statuses = (Array.isArray(status) ? status : [status]).map(value =>
      requireOneOf(value, MeetingActionItemStatus, 'Status')
    );
    selector.status = { $in: statuses };
  }
  if (dueBefore) selector.dueDate = { $lt: toDate(dueBefore, 'dueBefore') };

  const [data, totalResults] = await Promise.all([
    MeetingActionItems.find(selector, {
      sort: { dueDate: 1, createdAt: 1, _id: 1 },
      skip,
      limit,
    }).fetchAsync(),
    MeetingActionItems.find(selector).countAsync(),
  ]);
  return { data, totalResults };
}
