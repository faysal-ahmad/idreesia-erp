import { POLLS_MODULE, PollsAction } from 'meteor/idreesia-common/constants/polls';
import type { PollDocument } from 'meteor/idreesia-common/server/collections/polls';
import {
  createNotifier,
  type ModuleNotification,
} from 'meteor/idreesia-common/server/headless';

/**
 * The notifications the polls module publishes:
 * - an open poll was cancelled;
 * - a poll was closed early, so its results are available.
 *
 * A poll is meant for everyone in the committee, so each notification is
 * stored once with no recipient and every committee member sees it. The user
 * who caused the change is the actor and never sees it.
 *
 * Publishing is best effort: a failure is logged and never fails the poll
 * operation that caused it.
 */

const notifier = createNotifier(POLLS_MODULE);

type NotifiablePoll = Pick<PollDocument, '_id' | 'workspaceId' | 'title'>;

/** Logs a failed publish instead of failing the operation that caused it. */
const bestEffort = async (description: string, action: () => Promise<void>) => {
  try {
    await action();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Polls: could not ${description}:`, error);
  }
};

type Details = { eventType: string; text: string; id: string };

const build = (
  poll: NotifiablePoll,
  { id, eventType, text }: Details,
  actorUserId: string,
  now: Date
): ModuleNotification => ({
  id,
  workspaceId: poll.workspaceId,
  entityType: 'poll',
  entityId: poll._id,
  eventType,
  eventDetails: text,
  createdAt: now,
  actorUserId,
});

/** #3: an open poll was cancelled. For everyone in the committee. */
export const buildCancelledNotification = (
  poll: NotifiablePoll,
  actorUserId: string,
  now = new Date()
): ModuleNotification =>
  build(
    poll,
    {
      id: `cancelled:${poll._id}`,
      eventType: PollsAction.POLL_CANCELLED,
      text: `Poll "${poll.title}" was cancelled.`,
    },
    actorUserId,
    now
  );

/** #4: a poll was closed early. For everyone in the committee. */
export const buildClosedNotification = (
  poll: NotifiablePoll,
  actorUserId: string,
  now = new Date()
): ModuleNotification =>
  build(
    poll,
    {
      id: `closed:${poll._id}`,
      eventType: PollsAction.POLL_CLOSED,
      text: `Poll "${poll.title}" is closed. Results are available.`,
    },
    actorUserId,
    now
  );

/** Call with the poll as it was before it was cancelled. */
export const notifyCancelled = (poll: NotifiablePoll, actorUserId: string) =>
  bestEffort('publish the cancelled notification', () =>
    notifier.publish(buildCancelledNotification(poll, actorUserId))
  );

export const notifyClosed = (poll: NotifiablePoll, actorUserId: string) =>
  bestEffort('publish the closed notification', () =>
    notifier.publish(buildClosedNotification(poll, actorUserId))
  );
