import { CommitteeMemberRoles } from 'meteor/idreesia-common/constants/organization';
import {
  Committees,
  OrgLocations,
  type OrgLocationDocument,
} from 'meteor/idreesia-common/server/collections/admin';

export interface OrgLocationObserverStat {
  karkunId: string;
  observedCommitteeCount: number;
  /** The committees counted, for showing which ones. */
  observedCommitteeIds: string[];
}

/**
 * For each observer of the location: how many of the committees in the
 * locations below it they are currently an observer of, which is what "Sync
 * Observers" brings up to date.
 */
export async function getOrgLocationObserverStats(
  location: OrgLocationDocument
): Promise<OrgLocationObserverStat[]> {
  const observerIds = location.observerKarkunIds ?? [];
  if (observerIds.length === 0) return [];

  const children = await OrgLocations.find(
    { allParentIds: location._id },
    { fields: { _id: 1 } }
  ).fetchAsync();
  const committees = (await Committees.find(
    { locationId: { $in: children.map(child => child._id) } },
    { fields: { members: 1 } }
  ).fetchAsync()) as unknown as Array<{
    _id: string;
    members?: Array<{ karkunId: string; role?: string }>;
  }>;

  const observed: string[] = [
    CommitteeMemberRoles.OBSERVER,
    CommitteeMemberRoles.INHERITED_OBSERVER,
  ];
  return observerIds.map(karkunId => {
    const observedCommitteeIds = committees
      .filter(committee =>
        (committee.members ?? []).some(
          member =>
            member.karkunId === karkunId && observed.includes(member.role ?? '')
        )
      )
      .map(committee => committee._id);
    return {
      karkunId,
      observedCommitteeCount: observedCommitteeIds.length,
      observedCommitteeIds,
    };
  });
}
