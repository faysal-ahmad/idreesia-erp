import { DataSource } from 'meteor/idreesia-common/constants';
import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import { CommitteeMemberRoles } from 'meteor/idreesia-common/constants/organization';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { Committees, OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';

import type { CommitteeDoc } from './types';

/**
 * Permissions given to a committee. Every member of the committee with one of
 * these roles holds them; guests and observers (direct or inherited) do not.
 */
export const PERMISSION_GRANTING_ROLES: string[] = [
  CommitteeMemberRoles.MEMBER,
  CommitteeMemberRoles.COORDINATOR,
];

interface CommitteeWithPermissions extends CommitteeDoc {
  color?: string;
  locationId: string;
}

/** The permissions a person holds through the committees they are on. */
export async function committeePermissionsOf(
  personId: string | null | undefined
): Promise<string[]> {
  if (!personId) return [];

  const committees = (await Committees.find(
    {
      members: {
        $elemMatch: {
          karkunId: personId,
          role: { $in: PERMISSION_GRANTING_ROLES },
        },
      },
      'permissions.0': { $exists: true },
    },
    { fields: { permissions: 1 } }
  ).fetchAsync()) as Array<{ permissions?: string[] }>;

  return [...new Set(committees.flatMap(c => c.permissions ?? []))];
}

/**
 * The karkun ids of the people who hold any of the permissions through a
 * committee (its members and coordinators).
 */
export async function committeeHolderKarkunIds(
  permissionKeys: string[]
): Promise<string[]> {
  const committees = (await Committees.find(
    { permissions: { $in: permissionKeys } },
    { fields: { members: 1 } }
  ).fetchAsync()) as unknown as CommitteeDoc[];

  return [
    ...new Set(
      committees.flatMap(c =>
        (c.members ?? [])
          .filter(m => PERMISSION_GRANTING_ROLES.includes(m.role ?? ''))
          .map(m => m.karkunId)
      )
    ),
  ];
}

export interface CommitteePermissionHolder {
  committeeId: string;
  name: string;
  locationId: string;
  locationName?: string;
  permissions: string[];
}

/**
 * The committees that hold any of the permissions, sorted by name, with the
 * name of the location each belongs to.
 */
export async function listCommitteesHolding(
  permissionKeys: string[]
): Promise<CommitteePermissionHolder[]> {
  const committees = (await Committees.find(
    { permissions: { $in: permissionKeys } },
    {
      fields: { name: 1, locationId: 1, permissions: 1 },
      sort: { name: 1 },
    }
  ).fetchAsync()) as unknown as CommitteeWithPermissions[];
  if (committees.length === 0) return [];

  const locationIds = [...new Set(committees.map(c => c.locationId))];
  const locations = (await OrgLocations.find(
    { _id: { $in: locationIds } },
    { fields: { name: 1 } }
  ).fetchAsync()) as Array<{ _id: string; name: string }>;
  const locationNames = new Map(locations.map(l => [l._id, l.name]));

  return committees.map(c => ({
    committeeId: c._id,
    name: c.name,
    locationId: c.locationId,
    locationName: locationNames.get(c.locationId),
    permissions: c.permissions ?? [],
  }));
}

export interface CommitteePickerEntry {
  _id: string;
  name: string;
  color?: string;
  /** Members and coordinators, the people who hold its permissions. */
  memberCount: number;
}

/** The committees of a location, for choosing one to give a permission to. */
export async function listLocationCommitteesForPicker(
  locationId: string
): Promise<CommitteePickerEntry[]> {
  const committees = (await Committees.find(
    { locationId },
    { fields: { name: 1, color: 1, members: 1 }, sort: { name: 1 } }
  ).fetchAsync()) as unknown as CommitteeWithPermissions[];

  return committees.map(c => ({
    _id: c._id,
    name: c.name,
    color: c.color,
    memberCount: (c.members ?? []).filter(m =>
      PERMISSION_GRANTING_ROLES.includes(m.role ?? '')
    ).length,
  }));
}

/**
 * Gives a permission to a committee, or takes it away. Callers check that the
 * permission belongs to their module.
 */
export async function changeCommitteePermission(
  committeeId: string,
  permissionKey: string,
  add: boolean,
  actingUser: { _id: string }
) {
  await runInTransaction(async () => {
    const committee = (await Committees.findOneAsync(committeeId, {
      fields: { permissions: 1 },
    })) as CommitteeDoc | undefined;
    if (!committee) throw new Error('Committee not found.');
    if ((committee.permissions ?? []).includes(permissionKey) === add) return; // Nothing to change.

    await Committees.updateAsync(
      committeeId,
      add
        ? { $addToSet: { permissions: permissionKey } }
        : { $pull: { permissions: permissionKey } }
    );

    await SecurityLogs.insertAsync({
      committeeId,
      operationType: SecurityOperationType.PERMISSIONS_CHANGED,
      operationBy: actingUser._id,
      operationTime: new Date(),
      operationDetails: {
        permissionsAdded: add ? [permissionKey] : [],
        permissionsRemoved: add ? [] : [permissionKey],
      },
      dataSource: DataSource.OPERATIONS,
      dataSourceDetail: null,
    });
  });
  return true;
}
