import { MEETINGS_MODULE, MeetingsAction } from 'meteor/idreesia-common/constants/meetings';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import type { MeetingDocument } from 'meteor/idreesia-common/server/collections/meetings';
import {
  createNotifier,
  type ModuleNotification,
} from 'meteor/idreesia-common/server/headless';

/**
 * The notifications the meetings module publishes, each to the participants
 * concerned (never to the user who caused it):
 * - invited to a meeting (on scheduling it, or when added later);
 * - a meeting was rescheduled;
 * - a meeting was cancelled.
 *
 * The module treats participant ids as opaque, but notifications go to ERP
 * users: a participant id is looked up as a person id, and a participant
 * with no ERP user is simply not notified.
 *
 * Publishing is best effort: a failure is logged and never fails the meeting
 * operation that caused it.
 */

const notifier = createNotifier(MEETINGS_MODULE);

type NotifiableMeeting = Pick<
  MeetingDocument,
  '_id' | 'workspaceId' | 'title' | 'startsAt' | 'endsAt' | 'timeZone'
>;

/** Logs a failed publish instead of failing the operation that caused it. */
const bestEffort = async (description: string, action: () => Promise<void>) => {
  try {
    await action();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Meetings: could not ${description}:`, error);
  }
};

const formatStart = (startsAt: Date, timeZone: string) => {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone,
    }).format(startsAt);
  } catch {
    return startsAt.toISOString();
  }
};

type Details = { eventType: string; text: string; id: string };

const build = (
  meeting: NotifiableMeeting,
  { id, eventType, text }: Details,
  recipientUserId: string,
  actorUserId: string,
  now: Date
): ModuleNotification => ({
  id,
  workspaceId: meeting.workspaceId,
  entityType: 'meeting',
  entityId: meeting._id,
  eventType,
  eventDetails: text,
  data: {
    startsAt: meeting.startsAt.toISOString(),
    endsAt: meeting.endsAt.toISOString(),
  },
  createdAt: now,
  recipientUserId,
  actorUserId,
});

/** #1: invited to a meeting. One per invited user. */
export const buildInvitedNotification = (
  meeting: NotifiableMeeting,
  recipientUserId: string,
  actorUserId: string,
  now = new Date()
): ModuleNotification =>
  build(
    meeting,
    {
      id: `invited:${meeting._id}:${recipientUserId}`,
      eventType: 'meeting-invited',
      text: `You are invited to "${meeting.title}" on ${formatStart(meeting.startsAt, meeting.timeZone)}.`,
    },
    recipientUserId,
    actorUserId,
    now
  );

/**
 * #2: the meeting moved. One id per meeting and user, so repeated changes
 * are one notification, unread again each time.
 */
export const buildRescheduledNotification = (
  meeting: NotifiableMeeting,
  recipientUserId: string,
  actorUserId: string,
  now = new Date()
): ModuleNotification =>
  build(
    meeting,
    {
      id: `rescheduled:${meeting._id}:${recipientUserId}`,
      eventType: MeetingsAction.MEETING_RESCHEDULED,
      text: `"${meeting.title}" was rescheduled to ${formatStart(meeting.startsAt, meeting.timeZone)}.`,
    },
    recipientUserId,
    actorUserId,
    now
  );

/** #3: the meeting was cancelled. */
export const buildCancelledNotification = (
  meeting: NotifiableMeeting,
  recipientUserId: string,
  actorUserId: string,
  now = new Date()
): ModuleNotification =>
  build(
    meeting,
    {
      id: `cancelled:${meeting._id}:${recipientUserId}`,
      eventType: MeetingsAction.MEETING_CANCELLED,
      text: `"${meeting.title}" was cancelled.`,
    },
    recipientUserId,
    actorUserId,
    now
  );

/** The ERP users behind these participants, leaving out the acting user. */
const recipientUserIds = async (
  participantIds: string[],
  actorUserId: string
): Promise<string[]> => {
  if (!participantIds.length) return [];
  const users = await Users.findByPersonIds(participantIds);
  return users.map(({ _id }) => _id).filter(id => id !== actorUserId);
};

const publishToParticipants = async (
  participantIds: string[],
  actorUserId: string,
  buildFor: (userId: string) => ModuleNotification
) => {
  for (const userId of await recipientUserIds(participantIds, actorUserId)) {
    await notifier.publish(buildFor(userId));
  }
};

export const notifyInvited = (
  meeting: NotifiableMeeting,
  participantIds: string[],
  actorUserId: string
) =>
  bestEffort('publish the invitation notifications', () =>
    publishToParticipants(participantIds, actorUserId, userId =>
      buildInvitedNotification(meeting, userId, actorUserId)
    )
  );

/** Only when the start or end time actually changed. */
export const notifyRescheduled = (
  before: Pick<MeetingDocument, 'startsAt' | 'endsAt'>,
  after: NotifiableMeeting & Pick<MeetingDocument, 'participants'>,
  actorUserId: string
) =>
  bestEffort('publish the rescheduled notifications', async () => {
    if (
      before.startsAt.getTime() === after.startsAt.getTime() &&
      before.endsAt.getTime() === after.endsAt.getTime()
    ) {
      return;
    }
    await publishToParticipants(
      after.participants.map(({ participantId }) => participantId),
      actorUserId,
      userId => buildRescheduledNotification(after, userId, actorUserId)
    );
  });

export const notifyCancelled = (
  meeting: NotifiableMeeting & Pick<MeetingDocument, 'participants'>,
  actorUserId: string
) =>
  bestEffort('publish the cancelled notifications', () =>
    publishToParticipants(
      meeting.participants.map(({ participantId }) => participantId),
      actorUserId,
      userId => buildCancelledNotification(meeting, userId, actorUserId)
    )
  );
