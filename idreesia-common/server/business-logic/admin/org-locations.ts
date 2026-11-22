import { GraphQLError } from 'graphql';

import {
  OrgLocationAllowedChildTypes,
  OrgLocationTypes,
  type OrgLocationType,
} from 'meteor/idreesia-common/constants/organization';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { ensureKarkuns } from 'meteor/idreesia-common/server/business-logic/hr/ensure-karkuns';
import {
  OrgLocations,
  type OrgLocationDocument,
  type OrgLocationMehfilDetails,
} from 'meteor/idreesia-common/server/collections/admin';

interface UserRef {
  _id: string;
}

export interface OrgLocationValues {
  name: string;
  type: OrgLocationType;
  parentId?: string | null;
  mehfilDetails?: OrgLocationMehfilDetails | null;
}

const fail = (code: string, message: string): never => {
  throw new GraphQLError(message, { extensions: { code } });
};

/** Resolves and validates the parent for a location of the given type. */
async function resolveParent(
  type: OrgLocationType,
  parentId: string | null | undefined,
  selfId?: string
): Promise<OrgLocationDocument | null> {
  if (type === OrgLocationTypes.ROOT) {
    if (parentId) fail('BAD_USER_INPUT', 'The root location cannot have a parent.');
    return null;
  }

  if (!parentId) fail('BAD_USER_INPUT', 'A parent location is required.');

  const parent = await OrgLocations.findOneAsync({ _id: parentId as string });
  if (!parent) fail('NOT_FOUND', 'The parent location was not found.');

  const nonNullParent = parent as OrgLocationDocument;
  if (selfId && (nonNullParent._id === selfId || nonNullParent.allParentIds?.includes(selfId))) {
    fail('BAD_USER_INPUT', 'A location cannot be moved under itself.');
  }

  if (!OrgLocationAllowedChildTypes[nonNullParent.type].includes(type)) {
    fail(
      'BAD_USER_INPUT',
      `A ${type} cannot be placed under a ${nonNullParent.type}.`
    );
  }

  return nonNullParent;
}

function cleanMehfilDetails(
  type: OrgLocationType,
  mehfilDetails?: OrgLocationMehfilDetails | null
) {
  if (type !== OrgLocationTypes.MEHFIL || !mehfilDetails) return undefined;
  // Geofencing checks against the location, so it needs one.
  const hasLocation =
    mehfilDetails.latitude != null && mehfilDetails.longitude != null;
  return {
    ...mehfilDetails,
    attendanceGeofencing: hasLocation && !!mehfilDetails.attendanceGeofencing,
  };
}

async function assertNameAvailable(
  name: string,
  parentId: string | null | undefined,
  selfId?: string
) {
  const sibling = await OrgLocations.findOneAsync({
    name,
    parentId: parentId ?? null,
    ...(selfId ? { _id: { $ne: selfId } } : {}),
  } as Record<string, unknown>);
  if (sibling) {
    fail('CONFLICT', `A location named '${name}' already exists under this parent.`);
  }
}

export async function createOrgLocation(
  { name, type, parentId, mehfilDetails }: OrgLocationValues,
  user: UserRef
) {
  const trimmedName = name.trim();
  if (!trimmedName) fail('BAD_USER_INPUT', 'Name is required.');

  return runInTransaction(async () => {
    if (type === OrgLocationTypes.ROOT) {
      const existingRoot = await OrgLocations.findOneAsync({
        type: OrgLocationTypes.ROOT,
      });
      if (existingRoot) fail('CONFLICT', 'A root location already exists.');
    }

    const parent = await resolveParent(type, parentId);
    await assertNameAvailable(trimmedName, parent?._id);

    const date = new Date();
    const doc: OrgLocationDocument = {
      name: trimmedName,
      type,
      parentId: parent?._id ?? null,
      allParentIds: parent ? [...(parent.allParentIds ?? []), parent._id as string] : [],
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    };
    const details = cleanMehfilDetails(type, mehfilDetails);
    if (details) doc.mehfilDetails = details;

    const _id = await OrgLocations.insertAsync(doc);
    return OrgLocations.findOneAsync(_id);
  });
}

export async function updateOrgLocation(
  { _id, name, parentId, mehfilDetails }: Omit<OrgLocationValues, 'type'> & { _id: string },
  user: UserRef
) {
  const trimmedName = name.trim();
  if (!trimmedName) fail('BAD_USER_INPUT', 'Name is required.');

  return runInTransaction(async () => {
    const location = await OrgLocations.findOneAsync({ _id });
    if (!location) return fail('NOT_FOUND', 'Location not found.');
    const existing = location as OrgLocationDocument;

    // The type is fixed after creation; only the name, parent and mehfil
    // details can change.
    const parent = await resolveParent(existing.type, parentId, _id);
    await assertNameAvailable(trimmedName, parent?._id, _id);

    const newAllParentIds = parent
      ? [...(parent.allParentIds ?? []), parent._id as string]
      : [];
    const parentChanged = (existing.parentId ?? null) !== (parent?._id ?? null);

    const $set: Record<string, unknown> = {
      name: trimmedName,
      parentId: parent?._id ?? null,
      allParentIds: newAllParentIds,
      updatedAt: new Date(),
      updatedBy: user._id,
    };
    const $unset: Record<string, ''> = {};
    const details = cleanMehfilDetails(existing.type, mehfilDetails);
    if (details) $set.mehfilDetails = details;
    else if (existing.type === OrgLocationTypes.MEHFIL && mehfilDetails === null) {
      $unset.mehfilDetails = '';
    }

    await OrgLocations.updateAsync(
      { _id },
      Object.keys($unset).length ? { $set, $unset } : { $set }
    );

    if (parentChanged) {
      // Rewrite the ancestor path of every descendant.
      const oldPrefix = [...(existing.allParentIds ?? []), _id];
      const newPrefix = [...newAllParentIds, _id];
      const descendants = await OrgLocations.find({ allParentIds: _id }).fetchAsync();
      for (const d of descendants) {
        const ids = d.allParentIds ?? [];
        await OrgLocations.updateAsync(
          { _id: d._id },
          { $set: { allParentIds: [...newPrefix, ...ids.slice(oldPrefix.length)] } }
        );
      }
    }

    return OrgLocations.findOneAsync({ _id });
  });
}

export async function addOrgLocationObserver(
  locationId: string,
  karkunId: string,
  user: UserRef
) {
  return runInTransaction(async () => {
    await assertLocationExists(locationId);
    await ensureKarkuns([karkunId]);
    const added = await OrgLocations.updateAsync(
      { _id: locationId, observerKarkunIds: { $ne: karkunId } },
      {
        $push: { observerKarkunIds: karkunId },
        $set: { updatedAt: new Date(), updatedBy: user._id },
      }
    );
    if (added === 0) {
      fail('CONFLICT', 'This person is already an observer of the location.');
    }
    return OrgLocations.findOneAsync({ _id: locationId });
  });
}

export async function removeOrgLocationObserver(
  locationId: string,
  karkunId: string,
  user: UserRef
) {
  return runInTransaction(async () => {
    await assertLocationExists(locationId);
    const removed = await OrgLocations.updateAsync(
      { _id: locationId, observerKarkunIds: karkunId },
      {
        $pull: { observerKarkunIds: karkunId },
        $set: { updatedAt: new Date(), updatedBy: user._id },
      }
    );
    if (removed === 0) {
      fail('NOT_FOUND', 'This person is not an observer of the location.');
    }
    return OrgLocations.findOneAsync({ _id: locationId });
  });
}

/** Throws unless the location exists. */
export async function assertLocationExists(locationId: string) {
  const location = await OrgLocations.findOneAsync({ _id: locationId });
  if (!location) fail('NOT_FOUND', 'Location not found.');
}
