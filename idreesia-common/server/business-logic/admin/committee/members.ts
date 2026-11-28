import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  CommitteeMemberRoles,
  CommitteeMemberRoleValues,
  type CommitteeMemberRole,
} from 'meteor/idreesia-common/constants/organization';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { Committees } from 'meteor/idreesia-common/server/collections/admin';
import { ensureKarkuns } from 'meteor/idreesia-common/server/business-logic/hr-karkuns/ensure-karkuns';

import { runMemberHooks } from './committee-features';
import { hasDiscussionRole } from './discussion-roles';
import { MemberEvent, notifyMemberChange } from './members-notifications';
import type { CommitteeDoc } from './types';

/**
 * Committee membership changes. Every add/remove goes through here so the
 * committee's enabled features (e.g. the Discussions chat group) follow the
 * membership. Callers check permissions; `userId`, when given, is recorded
 * as the updater.
 */

const loadCommittee = async (committeeId: string) => {
  const committee = (await Committees.findOneAsync(committeeId)) as
    | CommitteeDoc
    | undefined;
  if (!committee) throw new Error('Committee not found.');
  return committee;
};

const updaterFields = (userId?: string) =>
  userId ? { $set: { updatedAt: new Date(), updatedBy: userId } } : {};

// Inherited observers come from a parent location, so they are managed there.
const assertNotInheritedObserver = (committee: CommitteeDoc, karkunId: string) => {
  const member = (committee.members ?? []).find(m => m.karkunId === karkunId);
  if (member?.role === CommitteeMemberRoles.INHERITED_OBSERVER) {
    throw new Error(
      'Inherited observers can only be changed from the parent location.'
    );
  }
};

/**
 * `fromSync` is for the location observers sync, which manages inherited
 * observers in bulk: it may remove them, and it does not notify the committee
 * for each one.
 */
interface MemberChangeOptions {
  fromSync?: boolean;
}

export const addCommitteeMember = (
  committeeId: string,
  karkunId: string,
  userId?: string,
  role: CommitteeMemberRole = CommitteeMemberRoles.MEMBER,
  options: MemberChangeOptions = {}
) =>
  runInTransaction(async () => {
    if (!CommitteeMemberRoleValues.includes(role)) {
      throw new Error('Invalid committee member role.');
    }
    const committee = await loadCommittee(committeeId);
    await ensureKarkuns([karkunId]);
    if ((committee.members ?? []).some(member => member.karkunId === karkunId)) {
      throw new Error('This person is already a member of the committee.');
    }

    await runMemberHooks(committee, 'memberAdded', karkunId, role);

    const added = await Committees.updateAsync(
      { _id: committeeId, 'members.karkunId': { $ne: karkunId } },
      { $push: { members: { karkunId, role } }, ...updaterFields(userId) }
    );
    if (added === 0) {
      throw new Error('This person is already a member of the committee.');
    }

    if (options.fromSync) return;

    await notifyMemberChange(
      MemberEvent.ADDED,
      await loadCommittee(committeeId),
      karkunId,
      userId
    );
  });

export const removeCommitteeMember = (
  committeeId: string,
  karkunId: string,
  userId?: string,
  options: MemberChangeOptions = {}
) =>
  runInTransaction(async () => {
    const committee = await loadCommittee(committeeId);
    if (!(committee.members ?? []).some(member => member.karkunId === karkunId)) {
      throw new Error('This person is not a member of the committee.');
    }

    if (!options.fromSync) assertNotInheritedObserver(committee, karkunId);

    await runMemberHooks(committee, 'memberRemoved', karkunId);

    await Committees.updateAsync(committeeId, {
      $pull: { members: { karkunId } },
      ...updaterFields(userId),
    });

    if (options.fromSync) return;

    await notifyMemberChange(
      MemberEvent.REMOVED,
      await loadCommittee(committeeId),
      karkunId,
      userId
    );
  });

/**
 * Sets a member's role (member, coordinator, guest or observer). Does nothing
 * when the role is already as asked. Only becoming, or ceasing to be, a
 * coordinator notifies anyone.
 */
export const setCommitteeMemberRole = (
  committeeId: string,
  karkunId: string,
  role: CommitteeMemberRole,
  userId?: string
) =>
  runInTransaction(async () => {
    if (!CommitteeMemberRoleValues.includes(role)) {
      throw new Error('Invalid committee member role.');
    }
    const committee = await loadCommittee(committeeId);
    const member = (committee.members ?? []).find(m => m.karkunId === karkunId);
    if (!member) throw new Error('This person is not a member of the committee.');
    const previousRole = member.role ?? CommitteeMemberRoles.MEMBER;
    if (previousRole === role) return;
    assertNotInheritedObserver(committee, karkunId);

    // Keep the discussion chat group in step with the role.
    const wasInDiscussion = hasDiscussionRole(previousRole);
    const isInDiscussion = hasDiscussionRole(role);
    if (!wasInDiscussion && isInDiscussion) {
      await runMemberHooks(committee, 'memberAdded', karkunId, role);
    } else if (wasInDiscussion && !isInDiscussion) {
      await runMemberHooks(committee, 'memberRemoved', karkunId);
    }

    await Committees.updateAsync(
      { _id: committeeId, 'members.karkunId': karkunId },
      {
        $set: {
          'members.$.role': role,
          ...(userId ? { updatedAt: new Date(), updatedBy: userId } : {}),
        },
      }
    );

    const wasCoordinator = previousRole === CommitteeMemberRoles.COORDINATOR;
    const isCoordinator = role === CommitteeMemberRoles.COORDINATOR;
    if (wasCoordinator === isCoordinator) return;

    await notifyMemberChange(
      isCoordinator
        ? MemberEvent.COORDINATOR_ASSIGNED
        : MemberEvent.COORDINATOR_REMOVED,
      await loadCommittee(committeeId),
      karkunId,
      userId
    );
  });

/** Makes a member a coordinator, or a plain member again. */
export const setCommitteeMemberCoordinator = (
  committeeId: string,
  karkunId: string,
  isCoordinator: boolean,
  userId?: string
) =>
  setCommitteeMemberRole(
    committeeId,
    karkunId,
    isCoordinator
      ? CommitteeMemberRoles.COORDINATOR
      : CommitteeMemberRoles.MEMBER,
    userId
  );

/**
 * Member counts shown on the committees list. `memberCount` is coordinators
 * plus plain members; guests and observers (direct and inherited) are
 * counted separately. A member
 * without a role is a plain member.
 */
export const getCommitteeMemberCounts = (committee: CommitteeDoc) => {
  const counts = { memberCount: 0, guestCount: 0, observerCount: 0 };
  for (const member of committee.members ?? []) {
    switch (member.role ?? CommitteeMemberRoles.MEMBER) {
      case CommitteeMemberRoles.GUEST:
        counts.guestCount += 1;
        break;
      case CommitteeMemberRoles.OBSERVER:
      case CommitteeMemberRoles.INHERITED_OBSERVER:
        counts.observerCount += 1;
        break;
      default:
        counts.memberCount += 1;
    }
  }
  return counts;
};

/**
 * One page of the committee's members who have one of `roles`, coordinators
 * first and then by name. `totalResults` counts all of them, not just the
 * page.
 */
export const getCommitteeMembersPage = async (
  committee: CommitteeDoc,
  roles: string[],
  pageIndex: number,
  pageSize: number
) => {
  const matching = (committee.members ?? []).filter(member =>
    roles.includes(member.role ?? CommitteeMemberRoles.MEMBER)
  );

  const people = (await People.find(
    { _id: { $in: matching.map(member => member.karkunId) } },
    { fields: { 'sharedData.name': 1 } }
  ).fetchAsync()) as unknown as Array<{
    _id: string;
    sharedData?: { name?: string };
  }>;
  const nameById = new Map(
    people.map(person => [person._id, person.sharedData?.name ?? ''])
  );

  const isCoordinator = (member: { role?: string }) =>
    member.role === CommitteeMemberRoles.COORDINATOR;
  const sorted = [...matching].sort((a, b) => {
    if (isCoordinator(a) !== isCoordinator(b)) return isCoordinator(a) ? -1 : 1;
    return (nameById.get(a.karkunId) ?? '').localeCompare(
      nameById.get(b.karkunId) ?? ''
    );
  });

  const safePageSize = Math.max(1, pageSize);
  const start = Math.max(0, pageIndex) * safePageSize;
  return {
    totalResults: sorted.length,
    data: sorted.slice(start, start + safePageSize),
  };
};

/** Removes a person from every committee they belong to (e.g. on delete). */
export const removePersonFromCommittees = (personId: string) =>
  runInTransaction(async () => {
    const committees = (await Committees.find({
      'members.karkunId': personId,
    }).fetchAsync()) as unknown as CommitteeDoc[];

    for (const committee of committees) {
      await runMemberHooks(committee, 'memberRemoved', personId);
      await Committees.updateAsync(committee._id, {
        $pull: { members: { karkunId: personId } },
      });
      await notifyMemberChange(
        MemberEvent.REMOVED,
        await loadCommittee(committee._id),
        personId
      );
    }
  });

