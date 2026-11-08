import { Random } from 'meteor/random';

import {
  MEETINGS_MAX_AGENDA_ITEMS,
  MeetingsAction,
  MeetingsEntityType,
} from 'meteor/idreesia-common/constants/meetings';
import {
  MeetingActionItems,
  type MeetingAgendaItem,
  type MeetingDocument,
} from 'meteor/idreesia-common/server/collections/meetings';

import { logActivity } from './activity';
import { meetingsError } from './errors';
import {
  EDITABLE_STATUSES,
  normalizeOpaqueId,
  normalizeText,
  normalizeTitle,
  requireMeeting,
  requireUserId,
  writeMeeting,
} from './internal';

export interface AgendaItemInput {
  title: string;
  description?: string;
  /** Planned length, in whole minutes. */
  durationMinutes?: number;
  /** Opaque id of whoever presents it (e.g. a participant id). */
  presenterId?: string;
}

function normalizeDuration(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Number.isSafeInteger(value) || (value as number) < 1) {
    throw meetingsError(
      'BAD_USER_INPUT',
      'Duration must be a positive number of minutes'
    );
  }
  return value as number;
}

const optionalId = (value: unknown, what: string) =>
  value === undefined || value === null || value === ''
    ? undefined
    : normalizeOpaqueId(value, what);

export function buildAgendaItem(input: AgendaItemInput): MeetingAgendaItem {
  const description = normalizeText(input?.description, 'Description');
  const durationMinutes = normalizeDuration(input?.durationMinutes);
  const presenterId = optionalId(input?.presenterId, 'Presenter id');
  return {
    _id: Random.id(),
    title: normalizeTitle(input?.title, 'Agenda item title'),
    ...(description ? { description } : {}),
    ...(durationMinutes ? { durationMinutes } : {}),
    ...(presenterId ? { presenterId } : {}),
  };
}

export function buildAgenda(inputs: unknown): MeetingAgendaItem[] {
  if (inputs === undefined || inputs === null) return [];
  if (!Array.isArray(inputs)) {
    throw meetingsError('BAD_USER_INPUT', 'Agenda must be a list');
  }
  if (inputs.length > MEETINGS_MAX_AGENDA_ITEMS) {
    throw meetingsError(
      'BAD_USER_INPUT',
      `An agenda can have at most ${MEETINGS_MAX_AGENDA_ITEMS} items`
    );
  }
  return (inputs as AgendaItemInput[]).map(buildAgendaItem);
}

function findAgendaItem(meeting: MeetingDocument, agendaItemId: string) {
  const index = meeting.agenda.findIndex(({ _id }) => _id === agendaItemId);
  if (index < 0) throw meetingsError('NOT_FOUND', 'Agenda item not found');
  return index;
}

/** Adds an agenda item, at the end or at `position` (0-based). */
export async function addAgendaItem(
  meetingId: string,
  input: AgendaItemInput & { position?: number },
  userId: string
): Promise<{ meeting: MeetingDocument; agendaItem: MeetingAgendaItem }> {
  requireUserId(userId);
  const meeting = await requireMeeting(meetingId);
  if (meeting.agenda.length >= MEETINGS_MAX_AGENDA_ITEMS) {
    throw meetingsError(
      'BAD_USER_INPUT',
      `An agenda can have at most ${MEETINGS_MAX_AGENDA_ITEMS} items`
    );
  }
  const agendaItem = buildAgendaItem(input);
  const { position } = input;
  if (
    position !== undefined &&
    (!Number.isSafeInteger(position) ||
      position < 0 ||
      position > meeting.agenda.length)
  ) {
    throw meetingsError('BAD_USER_INPUT', 'Position is out of range');
  }
  const agenda = [...meeting.agenda];
  agenda.splice(position ?? agenda.length, 0, agendaItem);

  const updated = await writeMeeting(
    meeting,
    userId,
    { $set: { agenda } },
    { allowed: EDITABLE_STATUSES }
  );
  await logActivity({
    workspaceId: meeting.workspaceId,
    meetingId,
    entityType: MeetingsEntityType.AGENDA_ITEM,
    entityId: agendaItem._id,
    action: MeetingsAction.AGENDA_ITEM_ADDED,
    userId,
    details: { title: agendaItem.title },
  });
  return { meeting: updated, agendaItem };
}

export interface UpdateAgendaItemInput {
  title?: string;
  /** null clears it. */
  description?: string | null;
  /** null clears it. */
  durationMinutes?: number | null;
  /** null clears it. */
  presenterId?: string | null;
}

export async function updateAgendaItem(
  meetingId: string,
  agendaItemId: string,
  changes: UpdateAgendaItemInput,
  userId: string
): Promise<MeetingDocument> {
  requireUserId(userId);
  const meeting = await requireMeeting(meetingId);
  const index = findAgendaItem(meeting, agendaItemId);
  const item: MeetingAgendaItem = { ...meeting.agenda[index] };

  if (changes.title !== undefined) {
    item.title = normalizeTitle(changes.title, 'Agenda item title');
  }
  if (changes.description !== undefined) {
    const description = normalizeText(changes.description, 'Description');
    if (description) item.description = description;
    else delete item.description;
  }
  if (changes.durationMinutes !== undefined) {
    const durationMinutes = normalizeDuration(changes.durationMinutes);
    if (durationMinutes) item.durationMinutes = durationMinutes;
    else delete item.durationMinutes;
  }
  if (changes.presenterId !== undefined) {
    const presenterId = optionalId(changes.presenterId, 'Presenter id');
    if (presenterId) item.presenterId = presenterId;
    else delete item.presenterId;
  }

  const agenda = meeting.agenda.map((existing, i) =>
    i === index ? item : existing
  );
  const updated = await writeMeeting(
    meeting,
    userId,
    { $set: { agenda } },
    { allowed: EDITABLE_STATUSES }
  );
  await logActivity({
    workspaceId: meeting.workspaceId,
    meetingId,
    entityType: MeetingsEntityType.AGENDA_ITEM,
    entityId: agendaItemId,
    action: MeetingsAction.AGENDA_ITEM_UPDATED,
    userId,
    details: { changed: Object.keys(changes) },
  });
  return updated;
}

/** Removes an agenda item; action items linked to it lose the link. */
export async function removeAgendaItem(
  meetingId: string,
  agendaItemId: string,
  userId: string
): Promise<MeetingDocument> {
  requireUserId(userId);
  const meeting = await requireMeeting(meetingId);
  const index = findAgendaItem(meeting, agendaItemId);
  const agenda = meeting.agenda.filter((_, i) => i !== index);

  const updated = await writeMeeting(
    meeting,
    userId,
    { $set: { agenda } },
    { allowed: EDITABLE_STATUSES }
  );
  await MeetingActionItems.updateAsync(
    { meetingId, agendaItemId },
    {
      $unset: { agendaItemId: 1 },
      $set: { updatedAt: new Date(), updatedBy: userId },
    },
    { multi: true }
  );
  await logActivity({
    workspaceId: meeting.workspaceId,
    meetingId,
    entityType: MeetingsEntityType.AGENDA_ITEM,
    entityId: agendaItemId,
    action: MeetingsAction.AGENDA_ITEM_REMOVED,
    userId,
    details: { title: meeting.agenda[index].title },
  });
  return updated;
}

/** Puts the agenda in the given order; it must list every item once. */
export async function reorderAgenda(
  meetingId: string,
  orderedIds: string[],
  userId: string
): Promise<MeetingDocument> {
  requireUserId(userId);
  const meeting = await requireMeeting(meetingId);
  const byId = new Map(meeting.agenda.map(item => [item._id, item]));
  if (
    !Array.isArray(orderedIds) ||
    orderedIds.length !== byId.size ||
    new Set(orderedIds).size !== byId.size ||
    orderedIds.some(id => !byId.has(id))
  ) {
    throw meetingsError(
      'BAD_USER_INPUT',
      'The new order must list every agenda item exactly once'
    );
  }

  const updated = await writeMeeting(
    meeting,
    userId,
    { $set: { agenda: orderedIds.map(id => byId.get(id)!) } },
    { allowed: EDITABLE_STATUSES }
  );
  await logActivity({
    workspaceId: meeting.workspaceId,
    meetingId,
    entityType: MeetingsEntityType.MEETING,
    entityId: meetingId,
    action: MeetingsAction.AGENDA_REORDERED,
    userId,
  });
  return updated;
}
