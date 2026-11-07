import { Committees } from 'meteor/idreesia-common/server/collections/hr';
import { ensureKarkuns } from 'meteor/idreesia-common/server/business-logic/hr/ensure-karkuns';

import { runMemberHooks } from './committee-features';
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

export const addCommitteeMember = async (
  committeeId: string,
  karkunId: string,
  userId?: string
) => {
  const committee = await loadCommittee(committeeId);
  await ensureKarkuns([karkunId]);
  if ((committee.members ?? []).some(member => member.karkunId === karkunId)) {
    throw new Error('This person is already a member of the committee.');
  }

  await runMemberHooks(committee, 'memberAdded', karkunId);

  const added = await Committees.updateAsync(
    { _id: committeeId, 'members.karkunId': { $ne: karkunId } },
    { $push: { members: { karkunId } }, ...updaterFields(userId) }
  );
  if (added === 0) {
    throw new Error('This person is already a member of the committee.');
  }
};

export const removeCommitteeMember = async (
  committeeId: string,
  karkunId: string,
  userId?: string
) => {
  const committee = await loadCommittee(committeeId);
  if (!(committee.members ?? []).some(member => member.karkunId === karkunId)) {
    throw new Error('This person is not a member of the committee.');
  }

  await runMemberHooks(committee, 'memberRemoved', karkunId);

  await Committees.updateAsync(committeeId, {
    $pull: { members: { karkunId } },
    ...updaterFields(userId),
  });
};

/** Removes a person from every committee they belong to (e.g. on delete). */
export const removePersonFromCommittees = async (personId: string) => {
  const committees = (await Committees.find({
    'members.karkunId': personId,
  }).fetchAsync()) as unknown as CommitteeDoc[];

  for (const committee of committees) {
    await runMemberHooks(committee, 'memberRemoved', personId);
    await Committees.updateAsync(committee._id, {
      $pull: { members: { karkunId: personId } },
    });
  }
};
