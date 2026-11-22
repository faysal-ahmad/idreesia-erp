import { CommitteeMemberRoles } from 'meteor/idreesia-common/constants/organization';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  Committees,
  OrgLocations,
} from 'meteor/idreesia-common/server/collections/admin';

import { addCommitteeMember, removeCommitteeMember } from './committee/members';
import { assertLocationExists } from './org-locations';
import type { CommitteeDoc } from './committee/types';

interface UserRef {
  _id: string;
}

export interface SyncOrgLocationObserversResult {
  committeesChecked: number;
  addedCount: number;
  removedCount: number;
}

/**
 * Brings the inherited observers of every committee in the locations below
 * this one in line with the location observers. The committees of the
 * location itself are not touched: observers apply to child locations only.
 *
 * A committee at location X inherits the observers of every ancestor of X.
 * Working from the committee's own chain, rather than from the location
 * being synced, is what keeps a person who is still an observer of a
 * location lower down: removing them higher up never removes them from the
 * committees under the lower location.
 *
 * A person who already has another role on the committee (member,
 * coordinator, guest or a direct observer) is left as they are.
 */
export async function syncOrgLocationObservers(
  locationId: string,
  user: UserRef
): Promise<SyncOrgLocationObserversResult> {
  await assertLocationExists(locationId);

  // Everything below the location, each with its ancestors.
  const locations = await OrgLocations.find({
    allParentIds: locationId,
  }).fetchAsync();
  const subtreeIds = locations.map(location => location._id!);
  const chainOf = new Map<string, string[]>(
    locations.map(location => [location._id!, location.allParentIds ?? []])
  );

  const committees = (await Committees.find({
    locationId: { $in: subtreeIds },
  }).fetchAsync()) as unknown as Array<CommitteeDoc & { locationId: string }>;

  // Every location whose observers can apply to these committees.
  const chainIds = new Set([...chainOf.values()].flat());
  const observersByLocation = new Map(
    (
      await OrgLocations.find({ _id: { $in: [...chainIds] } }).fetchAsync()
    ).map(location => [location._id!, location.observerKarkunIds ?? []])
  );

  const result: SyncOrgLocationObserversResult = {
    committeesChecked: committees.length,
    addedCount: 0,
    removedCount: 0,
  };

  for (const committee of committees) {
     
    await runInTransaction(async () => {
      const wanted = new Set(
        (chainOf.get(committee.locationId) ?? []).flatMap(
          id => observersByLocation.get(id) ?? []
        )
      );
      const members = committee.members ?? [];
      const existing = new Set(members.map(member => member.karkunId));

      for (const karkunId of wanted) {
        if (!existing.has(karkunId)) {
           
          await addCommitteeMember(
            committee._id,
            karkunId,
            user._id,
            CommitteeMemberRoles.INHERITED_OBSERVER,
            { fromSync: true }
          );
          result.addedCount += 1;
        }
      }

      for (const member of members) {
        if (
          member.role === CommitteeMemberRoles.INHERITED_OBSERVER &&
          !wanted.has(member.karkunId)
        ) {
           
          await removeCommitteeMember(committee._id, member.karkunId, user._id, {
            fromSync: true,
          });
          result.removedCount += 1;
        }
      }
    });
  }

  return result;
}
