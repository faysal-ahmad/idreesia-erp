import {
  MEETINGS_DEFAULT_MAX_FILE_SIZE,
  MEETINGS_DEFAULT_TIME_ZONE,
  MeetingStatus,
  type MeetingActionItemStatusValue,
  type MeetingStatusValue,
} from 'meteor/idreesia-common/constants/meetings';
import {
  completeAttachmentUpload,
  createAttachmentUploadUrl,
  getAttachmentDownloadUrl,
  getMeeting,
  getMeetingsWorkspace,
  listActionItems,
  listAttachments,
  listMeetings,
  listMeetingsActivity,
} from 'meteor/idreesia-common/server/business-logic/meetings';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  MeetingAttachments,
  Meetings,
  type MeetingActionItemDocument,
  type MeetingAttachmentDocument,
  type MeetingDocument,
  type MeetingsActivityDocument,
} from 'meteor/idreesia-common/server/collections/meetings';

import { getUserNames } from './documents-library';
import type { CommitteeDoc } from './types';

/*
 * A committee's meetings, as the Workspaces feature shows them: the
 * meetings-module records with member and user names instead of ids, and
 * timestamps as strings. Participants, presenters and assignees are
 * committee members (karkun ids). Callers check that the user may use the
 * committee's meetings (and that the ids belong to its workspace) first.
 */

type Names = Map<string, string>;

const timestamp = (date?: Date) => (date ? String(date.getTime()) : null);
const nameOf = (names: Names, id?: string | null) =>
  (id && names.get(id)) || null;

/** Names of karkuns (committee members), by their person id. */
async function getPersonNames(
  personIds: Array<string | null | undefined>
): Promise<Names> {
  const ids = [...new Set(personIds.filter((id): id is string => !!id))];
  if (!ids.length) return new Map();
  const people = (await People.find(
    { _id: { $in: ids } },
    { fields: { _id: 1, 'sharedData.name': 1 } }
  ).fetchAsync()) as Array<{ _id: string; sharedData?: { name?: string } }>;
  return new Map(
    people
      .filter(person => person.sharedData?.name)
      .map(person => [person._id, person.sharedData!.name!])
  );
}

export interface ViewContext {
  /** The acting ERP user. */
  userId: string;
  /** The acting user's karkun id - their participant id. */
  personId: string | null;
  isCoordinator: boolean;
}

// ---------------------------------------------------------------------------
// Info and members
// ---------------------------------------------------------------------------

export async function getCommitteeMeetingsInfo(
  workspaceId: string,
  context: ViewContext
) {
  const workspace = await getMeetingsWorkspace(workspaceId, context.userId);
  return {
    canManage: context.isCoordinator,
    myParticipantId: context.personId,
    maxFileSize:
      workspace.settings?.maxFileSize ?? MEETINGS_DEFAULT_MAX_FILE_SIZE,
    timeZone: MEETINGS_DEFAULT_TIME_ZONE,
  };
}

/** The committee's members, who can be invited, by name. */
export async function getCommitteeMeetingMembers(committee: CommitteeDoc) {
  const members = committee.members ?? [];
  const names = await getPersonNames(members.map(({ karkunId }) => karkunId));
  return members
    .map(member => ({
      participantId: member.karkunId,
      name: names.get(member.karkunId) ?? null,
      isCoordinator: !!member.isCoordinator,
    }))
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
}

/** True when every id is a member of the committee. */
export const areCommitteeMembers = (
  committee: CommitteeDoc,
  personIds: Array<string | null | undefined>
) => {
  const memberIds = new Set(
    (committee.members ?? []).map(({ karkunId }) => karkunId)
  );
  return personIds.every(id => !id || memberIds.has(id));
};

// ---------------------------------------------------------------------------
// Meetings
// ---------------------------------------------------------------------------

const meetingPersonIds = (meeting: MeetingDocument) => [
  ...meeting.participants.map(({ participantId }) => participantId),
  ...meeting.agenda.map(({ presenterId }) => presenterId),
];

const meetingUserIds = (meeting: MeetingDocument) => [
  meeting.createdBy,
  meeting.updatedBy,
  meeting.cancelledBy,
  meeting.completedBy,
  meeting.minutes?.updatedBy,
  ...meeting.participants.map(({ attendance }) => attendance?.markedBy),
];

function toMeeting(
  meeting: MeetingDocument,
  people: Names,
  users: Names,
  context: ViewContext
) {
  const me = meeting.participants.find(
    ({ participantId }) => participantId === context.personId
  );
  return {
    _id: meeting._id,
    title: meeting.title,
    description: meeting.description ?? null,
    location: meeting.location ?? null,
    onlineUrl: meeting.onlineUrl ?? null,
    startsAt: timestamp(meeting.startsAt),
    endsAt: timestamp(meeting.endsAt),
    timeZone: meeting.timeZone,
    status: meeting.status,
    cancelledAt: timestamp(meeting.cancelledAt),
    cancelledByName: nameOf(users, meeting.cancelledBy),
    cancellationReason: meeting.cancellationReason ?? null,
    completedAt: timestamp(meeting.completedAt),
    completedByName: nameOf(users, meeting.completedBy),
    participants: meeting.participants.map(participant => ({
      participantId: participant.participantId,
      name: nameOf(people, participant.participantId),
      role: participant.role,
      rsvpStatus: participant.rsvp.status,
      rsvpRespondedAt: timestamp(participant.rsvp.respondedAt),
      rsvpComment: participant.rsvp.comment ?? null,
      attendanceStatus: participant.attendance?.status ?? null,
      attendanceNote: participant.attendance?.note ?? null,
      attendanceMarkedAt: timestamp(participant.attendance?.markedAt),
      attendanceMarkedByName: nameOf(users, participant.attendance?.markedBy),
      isMe: participant.participantId === context.personId,
    })),
    agenda: meeting.agenda.map(item => ({
      _id: item._id,
      title: item.title,
      description: item.description ?? null,
      durationMinutes: item.durationMinutes ?? null,
      presenterId: item.presenterId ?? null,
      presenterName: nameOf(people, item.presenterId),
    })),
    minutes: meeting.minutes?.text ?? null,
    minutesUpdatedAt: timestamp(meeting.minutes?.updatedAt),
    minutesUpdatedByName: nameOf(users, meeting.minutes?.updatedBy),
    attachmentCount: meeting.attachmentCount,
    openActionItemCount: meeting.openActionItemCount,
    myRsvpStatus: me?.rsvp.status ?? null,
    createdAt: timestamp(meeting.createdAt),
    createdByName: nameOf(users, meeting.createdBy),
    updatedAt: timestamp(meeting.updatedAt),
    updatedByName: nameOf(users, meeting.updatedBy),
  };
}

async function mapMeetings(meetings: MeetingDocument[], context: ViewContext) {
  const [people, users] = await Promise.all([
    getPersonNames(meetings.flatMap(meetingPersonIds)),
    getUserNames(meetings.flatMap(meetingUserIds)),
  ]);
  return meetings.map(meeting => toMeeting(meeting, people, users, context));
}

export async function toCommitteeMeeting(
  meeting: MeetingDocument,
  context: ViewContext
) {
  return (await mapMeetings([meeting], context))[0];
}

export async function getCommitteeMeeting(
  meetingId: string,
  context: ViewContext
) {
  return toCommitteeMeeting(
    await getMeeting(meetingId, context.userId),
    context
  );
}

/** Which meetings a list shows. */
export type MeetingsView = 'upcoming' | 'past' | 'cancelled' | 'all';

export interface CommitteeMeetingsOptions {
  view?: MeetingsView | null;
  /** Meetings that end after this time (ms as a string). */
  from?: string | null;
  /** Meetings that start before this time (ms as a string). */
  to?: string | null;
  text?: string | null;
  pageIndex?: number | null;
  pageSize?: number | null;
}

const toPage = (pageIndex?: number | null, pageSize?: number | null) => {
  const limit = pageSize ?? 20;
  return { skip: (pageIndex ?? 0) * limit, limit };
};

const toDateOrUndefined = (value?: string | null) =>
  value ? new Date(Number(value)) : undefined;

/**
 * - upcoming: scheduled meetings that haven't ended, soonest first
 * - past: held (or due to have been held) meetings, latest first
 * - cancelled: cancelled meetings, latest first
 * - all: everything in the from/to range, soonest first (for a calendar)
 */
export async function listCommitteeMeetings(
  workspaceId: string,
  context: ViewContext,
  { view, from, to, text, pageIndex, pageSize }: CommitteeMeetingsOptions
) {
  const now = new Date();
  let status: MeetingStatusValue[] | undefined;
  let fromDate = toDateOrUndefined(from);
  let toDate = toDateOrUndefined(to);
  let sortOrder: 'asc' | 'desc' = 'asc';

  switch (view ?? 'upcoming') {
    case 'upcoming':
      status = [MeetingStatus.SCHEDULED];
      if (!fromDate || fromDate < now) fromDate = now;
      break;
    case 'past':
      status = [MeetingStatus.SCHEDULED, MeetingStatus.COMPLETED];
      if (!toDate || toDate > now) toDate = now;
      sortOrder = 'desc';
      break;
    case 'cancelled':
      status = [MeetingStatus.CANCELLED];
      sortOrder = 'desc';
      break;
    default:
      break;
  }

  const page = await listMeetings(workspaceId, context.userId, {
    status,
    from: fromDate,
    to: toDate,
    text: text?.trim() || undefined,
    sortOrder,
    ...toPage(pageIndex, pageSize),
  });
  return {
    data: await mapMeetings(page.data, context),
    totalResults: page.totalResults,
  };
}

// ---------------------------------------------------------------------------
// Attachments
// ---------------------------------------------------------------------------

function toAttachment(
  attachment: MeetingAttachmentDocument,
  users: Names,
  context: ViewContext
) {
  return {
    _id: attachment._id,
    name: attachment.name,
    description: attachment.description ?? null,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    size: attachment.size,
    createdAt: timestamp(attachment.createdAt),
    createdByName: nameOf(users, attachment.createdBy),
    canDelete:
      context.isCoordinator || attachment.createdBy === context.userId,
  };
}

export async function listCommitteeMeetingAttachments(
  meetingId: string,
  context: ViewContext
) {
  const attachments = await listAttachments(meetingId, context.userId);
  const users = await getUserNames(attachments.map(a => a.createdBy));
  return attachments.map(a => toAttachment(a, users, context));
}

export async function createCommitteeMeetingUpload(
  meetingId: string,
  input: { fileName: string; mimeType?: string | null; size: number },
  context: ViewContext
) {
  const mimeType = input.mimeType || 'application/octet-stream';
  const ticket = await createAttachmentUploadUrl(
    { meetingId, fileName: input.fileName, mimeType, size: input.size },
    context.userId
  );
  return {
    uploadId: ticket.uploadId,
    url: ticket.url,
    contentType: ticket.headers['Content-Type'],
    expiresAt: timestamp(ticket.expiresAt),
  };
}

export async function completeCommitteeMeetingUpload(
  uploadId: string,
  context: ViewContext
) {
  const attachment = await completeAttachmentUpload(uploadId, context.userId);
  const users = await getUserNames([attachment.createdBy]);
  return toAttachment(attachment, users, context);
}

/**
 * The workspace a pending or completed upload belongs to, so callers can
 * check it against the committee's before completing or aborting it.
 */
export async function getMeetingUploadWorkspaceId(uploadId: string) {
  const upload = uploadId
    ? await MeetingAttachments.findOneAsync(uploadId, {
        fields: { workspaceId: 1 },
      })
    : undefined;
  return upload?.workspaceId ?? null;
}

export async function getCommitteeMeetingDownloadUrl(
  attachmentId: string,
  context: ViewContext,
  { inline }: { inline?: boolean | null } = {}
) {
  const download = await getAttachmentDownloadUrl(
    attachmentId,
    context.userId,
    { inline: !!inline }
  );
  return { url: download.url, fileName: download.fileName };
}

// ---------------------------------------------------------------------------
// Action items
// ---------------------------------------------------------------------------

function toActionItem(
  item: MeetingActionItemDocument,
  people: Names,
  users: Names,
  meetingTitles: Map<string, string>,
  context: ViewContext
) {
  return {
    _id: item._id,
    meetingId: item.meetingId,
    meetingTitle: meetingTitles.get(item.meetingId) ?? null,
    agendaItemId: item.agendaItemId ?? null,
    title: item.title,
    description: item.description ?? null,
    assigneeId: item.assigneeId ?? null,
    assigneeName: nameOf(people, item.assigneeId),
    dueDate: timestamp(item.dueDate),
    status: item.status,
    completedAt: timestamp(item.completedAt),
    completedByName: nameOf(users, item.completedBy),
    createdAt: timestamp(item.createdAt),
    createdByName: nameOf(users, item.createdBy),
    canChangeStatus:
      context.isCoordinator ||
      (!!item.assigneeId && item.assigneeId === context.personId),
  };
}

export async function mapCommitteeActionItems(
  items: MeetingActionItemDocument[],
  context: ViewContext
) {
  const meetingIds = [...new Set(items.map(({ meetingId }) => meetingId))];
  const [people, users, meetings] = await Promise.all([
    getPersonNames(items.map(({ assigneeId }) => assigneeId)),
    getUserNames(items.flatMap(item => [item.createdBy, item.completedBy])),
    meetingIds.length
      ? Meetings.find(
          { _id: { $in: meetingIds } },
          { fields: { _id: 1, title: 1 } }
        ).fetchAsync()
      : Promise.resolve([]),
  ]);
  const titles = new Map(meetings.map(({ _id, title }) => [_id, title]));
  return items.map(item => toActionItem(item, people, users, titles, context));
}

export interface CommitteeActionItemsOptions {
  meetingId?: string | null;
  /** 'me' for the acting user's own items. */
  assigneeId?: string | null;
  status?: MeetingActionItemStatusValue[] | null;
  pageIndex?: number | null;
  pageSize?: number | null;
}

export async function listCommitteeActionItems(
  workspaceId: string,
  context: ViewContext,
  {
    meetingId,
    assigneeId,
    status,
    pageIndex,
    pageSize,
  }: CommitteeActionItemsOptions
) {
  const page = await listActionItems(workspaceId, context.userId, {
    meetingId: meetingId || undefined,
    assigneeId:
      assigneeId === 'me' ? context.personId ?? '-' : assigneeId || undefined,
    status: status?.length ? status : undefined,
    ...toPage(pageIndex, pageSize),
  });
  return {
    data: await mapCommitteeActionItems(page.data, context),
    totalResults: page.totalResults,
  };
}

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------

export async function getCommitteeMeetingActivity(
  workspaceId: string,
  context: ViewContext,
  {
    meetingId,
    before,
    limit,
  }: { meetingId?: string | null; before?: string | null; limit?: number | null }
) {
  const entries: MeetingsActivityDocument[] = await listMeetingsActivity(
    workspaceId,
    context.userId,
    {
      meetingId: meetingId || undefined,
      before: toDateOrUndefined(before),
      limit: limit ?? 50,
    }
  );
  const users = await getUserNames(entries.map(({ userId }) => userId));
  return entries.map(entry => ({
    _id: entry._id,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    meetingId: entry.meetingId ?? null,
    userName: nameOf(users, entry.userId),
    at: timestamp(entry.at),
    details: entry.details ? JSON.stringify(entry.details) : null,
  }));
}
