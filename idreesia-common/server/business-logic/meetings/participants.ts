import {
  MEETINGS_MAX_PARTICIPANTS,
  MeetingAttendanceStatus,
  MeetingParticipantRole,
  MeetingRsvpStatus,
  MeetingsAction,
  MeetingsEntityType,
  type MeetingAttendanceStatusValue,
  type MeetingParticipantRoleValue,
  type MeetingRsvpStatusValue,
} from 'meteor/idreesia-common/constants/meetings';
import type {
  MeetingDocument,
  MeetingParticipant,
} from 'meteor/idreesia-common/server/collections/meetings';

import { logActivity } from './activity';
import { meetingsError } from './errors';
import {
  EDITABLE_STATUSES,
  normalizeOpaqueId,
  normalizeText,
  requireMeeting,
  requireOneOf,
  requireUserId,
  SCHEDULED_ONLY,
  statusConflict,
  writeMeeting,
} from './internal';

export interface ParticipantInput {
  /** Any id the caller chooses (e.g. a karkun id). */
  participantId: string;
  /** Defaults to `required`. */
  role?: MeetingParticipantRoleValue;
}

/**
 * New participants (invitation pending), checked for duplicates among
 * themselves and against `existing`, and against the participant limit.
 */
export function buildParticipants(
  inputs: unknown,
  existing: MeetingParticipant[] = []
): MeetingParticipant[] {
  if (inputs === undefined || inputs === null) return [];
  if (!Array.isArray(inputs)) {
    throw meetingsError('BAD_USER_INPUT', 'Participants must be a list');
  }
  const seen = new Set(existing.map(({ participantId }) => participantId));
  const participants = (inputs as ParticipantInput[]).map(input => {
    const participantId = normalizeOpaqueId(
      input?.participantId,
      'Participant id'
    );
    if (seen.has(participantId)) {
      throw meetingsError(
        'CONFLICT',
        `Participant ${participantId} is already invited`,
        { participantId }
      );
    }
    seen.add(participantId);
    return {
      participantId,
      role:
        input.role === undefined
          ? MeetingParticipantRole.REQUIRED
          : requireOneOf(input.role, MeetingParticipantRole, 'Role'),
      rsvp: { status: MeetingRsvpStatus.PENDING },
    };
  });
  if (existing.length + participants.length > MEETINGS_MAX_PARTICIPANTS) {
    throw meetingsError(
      'BAD_USER_INPUT',
      `A meeting can have at most ${MEETINGS_MAX_PARTICIPANTS} participants`
    );
  }
  return participants;
}

function findParticipant(meeting: MeetingDocument, participantId: string) {
  const index = meeting.participants.findIndex(
    participant => participant.participantId === participantId
  );
  if (index < 0) {
    throw meetingsError('NOT_FOUND', 'Participant not found', {
      participantId,
    });
  }
  return index;
}

/** Invites more participants to a scheduled meeting. */
export async function addParticipants(
  meetingId: string,
  inputs: ParticipantInput[],
  userId: string
): Promise<MeetingDocument> {
  requireUserId(userId);
  const meeting = await requireMeeting(meetingId);
  const added = buildParticipants(inputs, meeting.participants);
  if (!added.length) return meeting;

  const updated = await writeMeeting(
    meeting,
    userId,
    { $set: { participants: [...meeting.participants, ...added] } },
    { allowed: SCHEDULED_ONLY }
  );
  await logActivity({
    workspaceId: meeting.workspaceId,
    meetingId,
    entityType: MeetingsEntityType.PARTICIPANT,
    entityId: meetingId,
    action: MeetingsAction.PARTICIPANTS_ADDED,
    userId,
    details: { participantIds: added.map(({ participantId }) => participantId) },
  });
  return updated;
}

export async function removeParticipant(
  meetingId: string,
  participantId: string,
  userId: string
): Promise<MeetingDocument> {
  requireUserId(userId);
  const meeting = await requireMeeting(meetingId);
  const index = findParticipant(meeting, participantId);
  const participants = meeting.participants.filter((_, i) => i !== index);

  const updated = await writeMeeting(
    meeting,
    userId,
    { $set: { participants } },
    { allowed: SCHEDULED_ONLY }
  );
  await logActivity({
    workspaceId: meeting.workspaceId,
    meetingId,
    entityType: MeetingsEntityType.PARTICIPANT,
    entityId: participantId,
    action: MeetingsAction.PARTICIPANT_REMOVED,
    userId,
  });
  return updated;
}

export async function setParticipantRole(
  meetingId: string,
  participantId: string,
  role: MeetingParticipantRoleValue,
  userId: string
): Promise<MeetingDocument> {
  requireUserId(userId);
  const newRole = requireOneOf(role, MeetingParticipantRole, 'Role');
  const meeting = await requireMeeting(meetingId);
  const index = findParticipant(meeting, participantId);
  const previous = meeting.participants[index].role;
  if (previous === newRole) return meeting;

  const participants = meeting.participants.map((participant, i) =>
    i === index ? { ...participant, role: newRole } : participant
  );
  const updated = await writeMeeting(
    meeting,
    userId,
    { $set: { participants } },
    { allowed: SCHEDULED_ONLY }
  );
  await logActivity({
    workspaceId: meeting.workspaceId,
    meetingId,
    entityType: MeetingsEntityType.PARTICIPANT,
    entityId: participantId,
    action: MeetingsAction.PARTICIPANT_ROLE_CHANGED,
    userId,
    details: { from: previous, to: newRole },
  });
  return updated;
}

export interface InvitationResponse {
  status: MeetingRsvpStatusValue;
  comment?: string | null;
}

/**
 * Records a participant's response to the invitation. `userId` is whoever
 * records it - the participant themself or someone on their behalf.
 */
export async function respondToInvitation(
  meetingId: string,
  participantId: string,
  { status, comment }: InvitationResponse,
  userId: string
): Promise<MeetingDocument> {
  requireUserId(userId);
  const rsvpStatus = requireOneOf(status, MeetingRsvpStatus, 'Response');
  const rsvpComment = normalizeText(comment, 'Comment');
  const meeting = await requireMeeting(meetingId);
  const index = findParticipant(meeting, participantId);

  const participants = meeting.participants.map((participant, i) =>
    i === index
      ? {
          ...participant,
          rsvp: {
            status: rsvpStatus,
            ...(rsvpStatus !== MeetingRsvpStatus.PENDING
              ? { respondedAt: new Date() }
              : {}),
            ...(rsvpComment ? { comment: rsvpComment } : {}),
          },
        }
      : participant
  );
  const updated = await writeMeeting(
    meeting,
    userId,
    { $set: { participants } },
    { allowed: SCHEDULED_ONLY }
  );
  await logActivity({
    workspaceId: meeting.workspaceId,
    meetingId,
    entityType: MeetingsEntityType.PARTICIPANT,
    entityId: participantId,
    action: MeetingsAction.INVITATION_RESPONDED,
    userId,
    details: { status: rsvpStatus },
  });
  return updated;
}

export interface AttendanceEntry {
  participantId: string;
  /** null clears the participant's attendance. */
  status: MeetingAttendanceStatusValue | null;
  note?: string | null;
}

/**
 * Records attendance for some or all participants, once the meeting has
 * started. Entries for participants not listed are left as they are.
 */
export async function markAttendance(
  meetingId: string,
  entries: AttendanceEntry[],
  userId: string
): Promise<MeetingDocument> {
  requireUserId(userId);
  if (!Array.isArray(entries) || !entries.length) {
    throw meetingsError('BAD_USER_INPUT', 'At least one entry is required');
  }
  const meeting = await requireMeeting(meetingId);
  if (!EDITABLE_STATUSES.includes(meeting.status)) {
    throw statusConflict(meeting, EDITABLE_STATUSES);
  }
  const now = new Date();
  if (meeting.startsAt > now) {
    throw meetingsError(
      'CONFLICT',
      "Attendance can't be recorded before the meeting starts"
    );
  }

  const participants = meeting.participants.map(participant => ({
    ...participant,
  }));
  const seen = new Set<string>();
  entries.forEach(entry => {
    const participantId = normalizeOpaqueId(
      entry?.participantId,
      'Participant id'
    );
    if (seen.has(participantId)) {
      throw meetingsError(
        'BAD_USER_INPUT',
        `Participant ${participantId} is listed more than once`
      );
    }
    seen.add(participantId);
    const index = findParticipant(meeting, participantId);
    if (entry.status === null) {
      delete participants[index].attendance;
      return;
    }
    const note = normalizeText(entry.note, 'Note');
    participants[index].attendance = {
      status: requireOneOf(entry.status, MeetingAttendanceStatus, 'Attendance'),
      ...(note ? { note } : {}),
      markedAt: now,
      markedBy: userId,
    };
  });

  const updated = await writeMeeting(
    meeting,
    userId,
    { $set: { participants } },
    { allowed: EDITABLE_STATUSES }
  );
  await logActivity({
    workspaceId: meeting.workspaceId,
    meetingId,
    entityType: MeetingsEntityType.MEETING,
    entityId: meetingId,
    action: MeetingsAction.ATTENDANCE_MARKED,
    userId,
    details: {
      entries: entries.map(({ participantId, status }) => ({
        participantId,
        status,
      })),
    },
  });
  return updated;
}
