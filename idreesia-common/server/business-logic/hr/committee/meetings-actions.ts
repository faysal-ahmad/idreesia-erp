import {
  addParticipants,
  createMeeting,
  removeParticipant,
  updateMeeting,
} from 'meteor/idreesia-common/server/business-logic/meetings';
import type { MeetingDocument } from 'meteor/idreesia-common/server/collections/meetings';

/*
 * Committee-side meeting changes that take more than one meetings-module
 * call, or translate the Workspaces API's inputs (timestamps as strings of
 * milliseconds). Callers check access first.
 */

/** A timestamp from the client: milliseconds, as a number or a string. */
export const parseTimestamp = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return undefined;
  const ms = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(ms) ? new Date(ms) : new Date(String(value));
};

export interface CommitteeMeetingInput {
  title: string;
  startsAt: string;
  endsAt: string;
  location?: string | null;
  onlineUrl?: string | null;
  description?: string | null;
}

export async function createCommitteeMeeting(
  workspaceId: string,
  input: CommitteeMeetingInput,
  participantIds: string[],
  timeZone: string,
  userId: string
) {
  return createMeeting(
    {
      workspaceId,
      title: input.title,
      startsAt: parseTimestamp(input.startsAt)!,
      endsAt: parseTimestamp(input.endsAt)!,
      timeZone,
      location: input.location ?? undefined,
      onlineUrl: input.onlineUrl ?? undefined,
      description: input.description ?? undefined,
      participants: [...new Set(participantIds)].map(participantId => ({
        participantId,
      })),
    },
    userId
  );
}

/**
 * Saves the edit form. The times are only sent when they changed, so the
 * other details of a completed meeting can still be edited.
 */
export async function updateCommitteeMeeting(
  meeting: MeetingDocument,
  input: CommitteeMeetingInput,
  userId: string
) {
  const startsAt = parseTimestamp(input.startsAt);
  const endsAt = parseTimestamp(input.endsAt);
  const timeChanged =
    startsAt?.getTime() !== meeting.startsAt.getTime() ||
    endsAt?.getTime() !== meeting.endsAt.getTime();
  return updateMeeting(
    meeting._id,
    {
      title: input.title,
      ...(timeChanged ? { startsAt, endsAt } : {}),
      location: input.location ?? null,
      onlineUrl: input.onlineUrl ?? null,
      description: input.description ?? null,
    },
    userId
  );
}

/**
 * Makes the participant list exactly `participantIds`: invites the new ones
 * (as required participants) and removes the rest. Existing participants
 * keep their role and response.
 */
export async function setCommitteeMeetingParticipants(
  meeting: MeetingDocument,
  participantIds: string[],
  userId: string
) {
  const wanted = new Set(participantIds);
  const current = new Set(meeting.participants.map(p => p.participantId));
  let updated = meeting;
  for (const participantId of current) {
    if (!wanted.has(participantId)) {
      updated = await removeParticipant(meeting._id, participantId, userId);
    }
  }
  const added = [...wanted].filter(id => !current.has(id));
  if (added.length) {
    updated = await addParticipants(
      meeting._id,
      added.map(participantId => ({ participantId })),
      userId
    );
  }
  return updated;
}
