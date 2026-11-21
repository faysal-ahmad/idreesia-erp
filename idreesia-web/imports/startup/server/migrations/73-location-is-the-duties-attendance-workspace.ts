import { Mongo } from 'meteor/mongo';
import { Migrations } from 'meteor/quave:migrations';

import { OrgLocationFeatureKeys } from 'meteor/idreesia-common/constants/organization';
import {
  OrgLocations,
  OrgLocationUsers,
} from 'meteor/idreesia-common/server/collections/admin';
import {
  DutiesAttendanceDayOverrides,
  DutiesAttendanceDayRecords,
  DutiesAttendanceDuties,
} from 'meteor/idreesia-common/server/collections/duties-attendance';
import { ensureOrgLocationUserIndexes } from 'meteor/idreesia-common/server/business-logic/admin';
import { ensureDutiesAttendanceIndexes } from 'meteor/idreesia-common/server/business-logic/duties-attendance';

const WORKSPACES = 'duties-attendance-workspaces';
const WORKSPACE_USERS = 'duties-attendance-workspace-users';

// The few driver calls used here; Meteor's typings for raw collections are
// narrower than the driver.
interface RawCollection {
  find(selector: object): { toArray(): Promise<Array<Record<string, any>>> };
  updateOne(selector: object, update: object, options?: object): Promise<unknown>;
  updateMany(selector: object, update: object): Promise<unknown>;
  dropIndex(index: object): Promise<unknown>;
  drop(): Promise<unknown>;
}

const raw = (collection: { rawCollection(): unknown }) =>
  collection.rawCollection() as unknown as RawCollection;

const ignoreMissing = (error: unknown) => {
  const message = error instanceof Error ? error.message : '';
  if (!/ns not found|index not found|IndexNotFound|NamespaceNotFound/i.test(message)) {
    throw error;
  }
};

// A location is the Duties and Attendance workspace: there is no separate
// workspace any more. Duties, overrides and day records point at the location
// (`locationId` instead of `workspaceId`), and the workspace users' permissions
// move to the location's users, prefixed with the feature key.
// Locations also lose their list of enabled features: Duties and Attendance is
// always available on a mehfil.
// Safe to run again. Workspaces without a location are left alone, and the old
// collections are kept while any exist.
Migrations.add({
  version: 73,
  async up() {
    const workspaces = raw(new Mongo.Collection(WORKSPACES));
    const workspaceUsers = raw(new Mongo.Collection(WORKSPACE_USERS));
    const feature = OrgLocationFeatureKeys.DUTIES_ATTENDANCE;

    await ensureOrgLocationUserIndexes();

    const locationByWorkspace = new Map<string, string>();
    let orphans = 0;
    for (const workspace of await workspaces.find({}).toArray()) {
      const workspaceId = String(workspace._id);
      const linked = await OrgLocations.findOneAsync({
        dutiesAttendanceWorkspaceId: workspaceId,
      } as never);
      const locationId =
        (workspace.metadata?.locationId as string | undefined) ?? linked?._id;
      if (!locationId) {
        orphans += 1;
        // eslint-disable-next-line no-console
        console.warn(`Duties and Attendance workspace ${workspaceId} has no location; skipped.`);
      } else {
        locationByWorkspace.set(workspaceId, locationId);
      }
    }

    for (const [workspaceId, locationId] of locationByWorkspace) {
      for (const collection of [
        DutiesAttendanceDuties,
        DutiesAttendanceDayOverrides,
        DutiesAttendanceDayRecords,
      ]) {
        await raw(collection).updateMany(
          { workspaceId },
          { $set: { locationId }, $unset: { workspaceId: '' } }
        );
      }
    }

    for (const entry of await workspaceUsers.find({}).toArray()) {
      const locationId = locationByWorkspace.get(String(entry.workspaceId));
      if (locationId) {
        await raw(OrgLocationUsers).updateOne(
          { locationId, userId: entry.userId },
          {
            $addToSet: {
              permissions: {
                $each: (entry.permissions as string[]).map(
                  permission => `${feature}.${permission}`
                ),
              },
            },
            $setOnInsert: {
              createdAt: entry.createdAt ?? new Date(),
              createdBy: entry.createdBy,
            },
            $set: {
              updatedAt: entry.updatedAt ?? new Date(),
              updatedBy: entry.updatedBy,
            },
          },
          { upsert: true }
        );
      }
    }

    // Features are always on for mehfils now, so locations no longer list
    // the enabled ones.
    await raw(OrgLocations).updateMany(
      {
        $or: [
          { dutiesAttendanceWorkspaceId: { $exists: true } },
          { features: { $exists: true } },
        ],
      },
      { $unset: { dutiesAttendanceWorkspaceId: '', features: '' } }
    );

    // The indexes that were keyed by workspace.
    for (const [collection, index] of [
      [DutiesAttendanceDuties, { workspaceId: 1, name: 1 }],
      [DutiesAttendanceDayRecords, { workspaceId: 1, date: 1 }],
    ] as Array<[{ rawCollection(): unknown }, object]>) {
      await raw(collection).dropIndex(index).catch(ignoreMissing);
    }
    await ensureDutiesAttendanceIndexes();

    if (orphans === 0) {
      await workspaceUsers.drop().catch(ignoreMissing);
      await workspaces.drop().catch(ignoreMissing);
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        `${orphans} Duties and Attendance workspace(s) have no location; the old collections were kept.`
      );
    }
  },
});
