import {
  MEETINGS_DEFAULT_TIME_ZONE,
  MeetingRsvpStatus,
  MeetingsAction,
  MeetingsEntityType,
  MeetingStatus,
  type MeetingRsvpStatusValue,
  type MeetingStatusValue,
} from 'meteor/idreesia-common/constants/meetings';
import {
  MeetingActionItems,
  MeetingAttachments,
  Meetings,
  type MeetingDocument,
  type MeetingsMetadata,
} from 'meteor/idreesia-common/server/collections/meetings';

import { logActivity } from './activity';
import { buildAgenda, type AgendaItemInput } from './agenda';
import { meetingsError } from './errors';
import {
  deleteFilesQuietly,
  EDITABLE_STATUSES,
  liveWorkspaceSelector,
  METADATA_KEY_PATTERN,
  normalizeOpaqueId,
  normalizePage,
  normalizeTags,
  normalizeText,
  normalizeTitle,
  normalizeUrl,
  requireMeeting,
  requireOneOf,
  requireUserId,
  requireWorkspace,
  SCHEDULED_ONLY,
  toDate,
  validateMetadata,
  validateTimeZone,
  writeMeeting,
  type MeetingsPage,
  type MeetingsPageOptions,
  type MeetingsSortOrder,
} from './internal';
import { buildParticipants, type ParticipantInput } from './participants';

function validateTimes(startsAt: Date, endsAt: Date) {
  if (endsAt <= startsAt) {
    throw meetingsError('BAD_USER_INPUT', 'A meeting must end after it starts');
  }
}

export interface CreateMeetingInput {
  workspaceId: string;
  title: string;
  startsAt: Date | string;
  endsAt: Date | string;
  /** IANA zone the meeting is shown in. Defaults to Asia/Karachi. */
  timeZone?: string;
  description?: string;
  location?: string;
  /** An http(s) link to join online. */
  onlineUrl?: string;
  tags?: string[];
  metadata?: MeetingsMetadata;
  participants?: ParticipantInput[];
  agenda?: AgendaItemInput[];
}

/** Schedules a one-off meeting. Every participant's invitation is pending. */
export async function createMeeting(
  input: CreateMeetingInput,
  userId: string
): Promise<MeetingDocument> {
  requireUserId(userId);
  const workspace = await requireWorkspace(input.workspaceId);
  const title = normalizeTitle(input.title, 'Meeting title');
  const startsAt = toDate(input.startsAt, 'Start time');
  const endsAt = toDate(input.endsAt, 'End time');
  validateTimes(startsAt, endsAt);
  const timeZone = validateTimeZone(
    input.timeZone ?? MEETINGS_DEFAULT_TIME_ZONE
  );
  const description = normalizeText(input.description, 'Description');
  const location = normalizeText(input.location, 'Location', 1000);
  const onlineUrl = normalizeUrl(input.onlineUrl, 'Online meeting link');
  const metadata = validateMetadata(input.metadata);

  const date = new Date();
  const meetingId = await Meetings.insertAsync({
    workspaceId: workspace._id,
    title,
    ...(description ? { description } : {}),
    ...(location ? { location } : {}),
    ...(onlineUrl ? { onlineUrl } : {}),
    startsAt,
    endsAt,
    timeZone,
    status: MeetingStatus.SCHEDULED,
    tags: normalizeTags(input.tags),
    ...(metadata ? { metadata } : {}),
    participants: buildParticipants(input.participants),
    agenda: buildAgenda(input.agenda),
    attachmentCount: 0,
    openActionItemCount: 0,
    revision: 0,
    createdAt: date,
    createdBy: userId,
    updatedAt: date,
    updatedBy: userId,
  });

  await logActivity({
    workspaceId: workspace._id,
    meetingId,
    entityType: MeetingsEntityType.MEETING,
    entityId: meetingId,
    action: MeetingsAction.MEETING_CREATED,
    userId,
    details: { title, startsAt, endsAt },
  });
  return requireMeeting(meetingId);
}

export async function getMeeting(
  meetingId: string,
  userId: string
): Promise<MeetingDocument> {
  requireUserId(userId);
  return requireMeeting(meetingId);
}

export interface UpdateMeetingInput {
  title?: string;
  /** Changing either time reschedules the meeting (scheduled ones only). */
  startsAt?: Date | string;
  endsAt?: Date | string;
  timeZone?: string;
  /** null clears it. */
  description?: string | null;
  /** null clears it. */
  location?: string | null;
  /** null clears it. */
  onlineUrl?: string | null;
  /** Replaces the current tags. */
  tags?: string[];
  /** Replaces the whole object; null clears it. */
  metadata?: MeetingsMetadata | null;
}

/**
 * Changes a meeting's details. Details can change on scheduled and
 * completed meetings; its time only while it is scheduled.
 */
export async function updateMeeting(
  meetingId: string,
  changes: UpdateMeetingInput,
  userId: string
): Promise<MeetingDocument> {
  requireUserId(userId);
  const meeting = await requireMeeting(meetingId);

  const $set: Record<string, unknown> = {};
  const $unset: Record<string, 1> = {};
  const setOrUnset = (field: string, value: unknown) => {
    if (value) $set[field] = value;
    else $unset[field] = 1;
  };

  if (changes.title !== undefined) {
    $set.title = normalizeTitle(changes.title, 'Meeting title');
  }
  const reschedules =
    changes.startsAt !== undefined || changes.endsAt !== undefined;
  const startsAt =
    changes.startsAt !== undefined
      ? toDate(changes.startsAt, 'Start time')
      : meeting.startsAt;
  const endsAt =
    changes.endsAt !== undefined
      ? toDate(changes.endsAt, 'End time')
      : meeting.endsAt;
  if (reschedules) {
    validateTimes(startsAt, endsAt);
    $set.startsAt = startsAt;
    $set.endsAt = endsAt;
  }
  if (changes.timeZone !== undefined) {
    $set.timeZone = validateTimeZone(changes.timeZone);
  }
  if (changes.description !== undefined) {
    setOrUnset(
      'description',
      normalizeText(changes.description, 'Description')
    );
  }
  if (changes.location !== undefined) {
    setOrUnset('location', normalizeText(changes.location, 'Location', 1000));
  }
  if (changes.onlineUrl !== undefined) {
    setOrUnset(
      'onlineUrl',
      normalizeUrl(changes.onlineUrl, 'Online meeting link')
    );
  }
  if (changes.tags !== undefined) $set.tags = normalizeTags(changes.tags);
  if (changes.metadata !== undefined) {
    setOrUnset('metadata', validateMetadata(changes.metadata));
  }

  const updated = await writeMeeting(
    meeting,
    userId,
    { $set, $unset },
    {
      allowed: reschedules ? SCHEDULED_ONLY : EDITABLE_STATUSES,
      checkRevision: false,
    }
  );

  if (reschedules) {
    await logActivity({
      workspaceId: meeting.workspaceId,
      meetingId,
      entityType: MeetingsEntityType.MEETING,
      entityId: meetingId,
      action: MeetingsAction.MEETING_RESCHEDULED,
      userId,
      details: {
        from: { startsAt: meeting.startsAt, endsAt: meeting.endsAt },
        to: { startsAt, endsAt },
      },
    });
  }
  const otherChanges = Object.keys(changes).filter(
    key => key !== 'startsAt' && key !== 'endsAt'
  );
  if (otherChanges.length) {
    await logActivity({
      workspaceId: meeting.workspaceId,
      meetingId,
      entityType: MeetingsEntityType.MEETING,
      entityId: meetingId,
      action: MeetingsAction.MEETING_UPDATED,
      userId,
      details: { changed: otherChanges },
    });
  }
  return updated;
}

interface MeetingFilterOptions {
  /** Meetings that end after this time. */
  from?: Date;
  /** Meetings that start before this time. */
  to?: Date;
  /** Meetings that have ended by this time. */
  endedBy?: Date;
  status?: MeetingStatusValue | MeetingStatusValue[];
  /** Meetings that have all of these tags. */
  tags?: string[];
  /** `{ key: value }`: exact match on top-level metadata values. */
  metadata?: Record<string, unknown>;
  /** Default `asc` (soonest first), by start time. */
  sortOrder?: MeetingsSortOrder;
}

export interface ListMeetingsOptions
  extends MeetingFilterOptions,
    MeetingsPageOptions {
  /** Only meetings this participant is invited to. */
  participantId?: string;
  /** Whole words in title, description and tags. */
  text?: string;
}

/** Selector conditions for the shared meeting filters. */
function buildFilter({
  from,
  to,
  endedBy,
  status,
  tags,
  metadata,
}: MeetingFilterOptions): Record<string, unknown> {
  const selector: Record<string, unknown> = {};
  if (from || endedBy) {
    selector.endsAt = {
      ...(from ? { $gt: toDate(from, 'from') } : {}),
      ...(endedBy ? { $lte: toDate(endedBy, 'endedBy') } : {}),
    };
  }
  if (to) selector.startsAt = { $lt: toDate(to, 'to') };
  if (status !== undefined) {
    const statuses = (Array.isArray(status) ? status : [status]).map(value =>
      requireOneOf(value, MeetingStatus, 'Status')
    );
    selector.status = { $in: statuses };
  }
  const normalizedTags = normalizeTags(tags);
  if (normalizedTags.length) selector.tags = { $all: normalizedTags };
  Object.entries(metadata ?? {}).forEach(([key, value]) => {
    if (!METADATA_KEY_PATTERN.test(key)) {
      throw meetingsError('BAD_USER_INPUT', `Invalid metadata key "${key}"`);
    }
    selector[`metadata.${key}`] = value;
  });
  return selector;
}

async function findPage(
  selector: Record<string, unknown>,
  sortOrder: MeetingsSortOrder | undefined,
  page: MeetingsPageOptions
): Promise<MeetingsPage<MeetingDocument>> {
  const { skip, limit } = normalizePage(page);
  const direction = sortOrder === 'desc' ? -1 : 1;
  const [data, totalResults] = await Promise.all([
    Meetings.find(selector, {
      sort: { startsAt: direction, _id: direction },
      skip,
      limit,
    }).fetchAsync(),
    Meetings.find(selector).countAsync(),
  ]);
  return { data, totalResults };
}

/** A workspace's meetings, by start time. */
export async function listMeetings(
  workspaceId: string,
  userId: string,
  {
    participantId,
    text,
    from,
    to,
    endedBy,
    status,
    tags,
    metadata,
    sortOrder,
    ...page
  }: ListMeetingsOptions = {}
): Promise<MeetingsPage<MeetingDocument>> {
  requireUserId(userId);
  await requireWorkspace(workspaceId);

  const selector: Record<string, unknown> = {
    workspaceId,
    ...buildFilter({ from, to, endedBy, status, tags, metadata }),
  };
  if (participantId) {
    selector['participants.participantId'] = normalizeOpaqueId(
      participantId,
      'Participant id'
    );
  }
  if (text?.trim()) selector.$text = { $search: text.trim() };
  return findPage(selector, sortOrder, page);
}

export interface ListParticipantMeetingsOptions
  extends MeetingFilterOptions,
    MeetingsPageOptions {
  /**
   * Only meetings in these workspaces - the ones the caller has authorised.
   * Unset means every workspace. Deleted workspaces are always left out.
   */
  workspaceIds?: string[];
  /** Only meetings where the participant's response is one of these. */
  rsvpStatus?: MeetingRsvpStatusValue | MeetingRsvpStatusValue[];
}

/** Every meeting a participant is invited to, across workspaces. */
export async function listParticipantMeetings(
  participantId: string,
  userId: string,
  {
    workspaceIds,
    rsvpStatus,
    from,
    to,
    status,
    tags,
    metadata,
    sortOrder,
    ...page
  }: ListParticipantMeetingsOptions = {}
): Promise<MeetingsPage<MeetingDocument>> {
  requireUserId(userId);
  const id = normalizeOpaqueId(participantId, 'Participant id');

  const selector: Record<string, unknown> = {
    workspaceId: await liveWorkspaceSelector(workspaceIds),
    ...buildFilter({ from, to, status, tags, metadata }),
  };
  if (rsvpStatus === undefined) {
    selector['participants.participantId'] = id;
  } else {
    const statuses = (Array.isArray(rsvpStatus) ? rsvpStatus : [rsvpStatus]).map(
      value => requireOneOf(value, MeetingRsvpStatus, 'Response')
    );
    selector.participants = {
      $elemMatch: { participantId: id, 'rsvp.status': { $in: statuses } },
    };
  }
  return findPage(selector, sortOrder, page);
}

/** Cancels a scheduled meeting. A cancelled meeting is read-only. */
export async function cancelMeeting(
  meetingId: string,
  userId: string,
  { reason }: { reason?: string } = {}
): Promise<MeetingDocument> {
  requireUserId(userId);
  const cancellationReason = normalizeText(reason, 'Reason');
  const meeting = await requireMeeting(meetingId);
  const updated = await writeMeeting(
    meeting,
    userId,
    {
      $set: {
        status: MeetingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: userId,
        ...(cancellationReason ? { cancellationReason } : {}),
      },
    },
    { allowed: SCHEDULED_ONLY, checkRevision: false }
  );
  await logActivity({
    workspaceId: meeting.workspaceId,
    meetingId,
    entityType: MeetingsEntityType.MEETING,
    entityId: meetingId,
    action: MeetingsAction.MEETING_CANCELLED,
    userId,
    ...(cancellationReason ? { details: { reason: cancellationReason } } : {}),
  });
  return updated;
}

/** Marks a scheduled meeting that has started as completed. */
export async function completeMeeting(
  meetingId: string,
  userId: string
): Promise<MeetingDocument> {
  requireUserId(userId);
  const meeting = await requireMeeting(meetingId);
  if (meeting.status === MeetingStatus.SCHEDULED && meeting.startsAt > new Date()) {
    throw meetingsError(
      'CONFLICT',
      "A meeting can't be completed before it starts"
    );
  }
  const updated = await writeMeeting(
    meeting,
    userId,
    {
      $set: {
        status: MeetingStatus.COMPLETED,
        completedAt: new Date(),
        completedBy: userId,
      },
    },
    { allowed: SCHEDULED_ONLY, checkRevision: false }
  );
  await logActivity({
    workspaceId: meeting.workspaceId,
    meetingId,
    entityType: MeetingsEntityType.MEETING,
    entityId: meetingId,
    action: MeetingsAction.MEETING_COMPLETED,
    userId,
  });
  return updated;
}

/** Puts a cancelled or completed meeting back to scheduled. */
export async function reopenMeeting(
  meetingId: string,
  userId: string
): Promise<MeetingDocument> {
  requireUserId(userId);
  const meeting = await requireMeeting(meetingId);
  const previousStatus = meeting.status;
  const updated = await writeMeeting(
    meeting,
    userId,
    {
      $set: { status: MeetingStatus.SCHEDULED },
      $unset: {
        cancelledAt: 1,
        cancelledBy: 1,
        cancellationReason: 1,
        completedAt: 1,
        completedBy: 1,
      },
    },
    {
      allowed: [MeetingStatus.CANCELLED, MeetingStatus.COMPLETED],
      checkRevision: false,
    }
  );
  await logActivity({
    workspaceId: meeting.workspaceId,
    meetingId,
    entityType: MeetingsEntityType.MEETING,
    entityId: meetingId,
    action: MeetingsAction.MEETING_REOPENED,
    userId,
    details: { from: previousStatus },
  });
  return updated;
}

/**
 * Permanently deletes a meeting with its attachments (and their files) and
 * action items. Its activity log entries are kept.
 */
export async function deleteMeeting(
  meetingId: string,
  userId: string
): Promise<void> {
  requireUserId(userId);
  const meeting = await requireMeeting(meetingId);
  const attachments = await MeetingAttachments.find(
    { meetingId },
    { fields: { fileKey: 1 } }
  ).fetchAsync();

  await Meetings.removeAsync(meetingId);
  await MeetingAttachments.removeAsync({ meetingId });
  await MeetingActionItems.removeAsync({ meetingId });
  await logActivity({
    workspaceId: meeting.workspaceId,
    meetingId,
    entityType: MeetingsEntityType.MEETING,
    entityId: meetingId,
    action: MeetingsAction.MEETING_DELETED,
    userId,
    details: { title: meeting.title, startsAt: meeting.startsAt },
  });
  await deleteFilesQuietly(attachments.map(({ fileKey }) => fileKey));
}
