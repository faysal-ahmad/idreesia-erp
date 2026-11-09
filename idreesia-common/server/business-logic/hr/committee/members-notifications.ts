import { CommitteeFeatureKeys } from 'meteor/idreesia-common/constants/hr';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  createCommitteeNotifier,
  type CommitteeNotification,
} from 'meteor/idreesia-common/server/headless';

import type { CommitteeDoc } from './types';

/**
 * The notifications the committee Members feature publishes. Members is not a
 * headless module and has no workspace, so these notifications belong to the
 * committee itself (a `committeeId` and no `workspaceId`).
 *
 * - a person was added to the committee;
 * - a person was removed from it (told to the members who remain; the removed
 *   person cannot see the committee any more);
 * - a person became a coordinator, or stopped being one.
 *
 * Each notification is addressed to one member and names the affected person.
 * The member who made the change is not notified (`actorUserId`). Publishing is best effort: a
 * failure is logged and never fails the membership change.
 */

export const MEMBERS_MODULE = 'members';

export const MemberEvent = {
  ADDED: 'member-added',
  REMOVED: 'member-removed',
  COORDINATOR_ASSIGNED: 'coordinator-assigned',
  COORDINATOR_REMOVED: 'coordinator-removed',
} as const;

export type MemberEventType = (typeof MemberEvent)[keyof typeof MemberEvent];

const notifier = createCommitteeNotifier(MEMBERS_MODULE);

const describe = (
  event: MemberEventType,
  committeeName: string,
  name: string
) => {
  switch (event) {
    case MemberEvent.ADDED:
      return `${name} was added to the ${committeeName} committee.`;
    case MemberEvent.REMOVED:
      return `${name} was removed from the ${committeeName} committee.`;
    case MemberEvent.COORDINATOR_ASSIGNED:
      return `${name} is now a coordinator of the ${committeeName} committee.`;
    default:
      return `${name} is no longer a coordinator of the ${committeeName} committee.`;
  }
};

/** One notification for one recipient. Pure, so it can be tested alone. */
export const buildMemberNotification = (params: {
  event: MemberEventType;
  committee: Pick<CommitteeDoc, '_id' | 'name'>;
  karkunId: string;
  karkunName: string;
  recipientUserId: string;
  actorUserId?: string;
  now?: Date;
}): CommitteeNotification => {
  const now = params.now ?? new Date();
  return {
    // One per event and recipient; the time keeps repeated events distinct.
    id: `${params.event}:${params.committee._id}:${params.karkunId}:${now.getTime()}:${params.recipientUserId}`,
    committeeId: params.committee._id,
    entityType: 'member',
    entityId: params.karkunId,
    eventType: params.event,
    eventDetails: describe(
      params.event,
      params.committee.name,
      params.karkunName
    ),
    recipientUserId: params.recipientUserId,
    ...(params.actorUserId ? { actorUserId: params.actorUserId } : {}),
    createdAt: now,
  };
};

/**
 * Tells the committee about a membership change. `committee` is the committee
 * as it is AFTER the change, so a removed person is not in `members` and is
 * not notified.
 */
export const notifyMemberChange = async (
  event: MemberEventType,
  committee: CommitteeDoc,
  karkunId: string,
  actorUserId?: string
): Promise<void> => {
  try {
    if (!(committee.features ?? []).includes(CommitteeFeatureKeys.MEMBERS)) {
      return;
    }
    const person = (await People.findOneAsync(karkunId, {
      fields: { 'sharedData.name': 1 },
    })) as { sharedData?: { name?: string } } | undefined;
    const karkunName = person?.sharedData?.name ?? 'A member';

    const personIds = (committee.members ?? []).map(member => member.karkunId);
    const users = await Users.findByPersonIds(personIds);
    const now = new Date();

    for (const user of users) {
      await notifier.publish(
        buildMemberNotification({
          event,
          committee,
          karkunId,
          karkunName,
          recipientUserId: user._id,
          actorUserId,
          now,
        })
      );
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Committee members: could not publish ${event}:`, error);
  }
};
