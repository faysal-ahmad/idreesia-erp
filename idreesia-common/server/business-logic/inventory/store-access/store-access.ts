import { StorePermissionValues } from 'meteor/idreesia-common/constants/stores-permissions';
import { PhysicalStoreAccess } from 'meteor/idreesia-common/server/collections/inventory';
import { isSuperAdmin } from 'meteor/idreesia-common/server/business-logic/admin/users/super-admin';

export interface StoreAccessUser {
  _id?: string;
  locked?: boolean;
  isSuperAdmin?: boolean;
  /** The ids of the user groups the user belongs to. */
  groups?: string[];
}

/** The permissions a user holds on each store, by physical store id. */
export type StoreAccessMap = Map<string, string[]>;

let indexesReady: Promise<void> | null = null;

/**
 * Creates the indexes of the store access entries once per process. Called
 * outside any transaction (which can't create them) before the writes that
 * rely on the unique index; the migration calls it too.
 */
export const ensurePhysicalStoreAccessIndexes = (): Promise<void> => {
  if (!indexesReady) {
    const access = PhysicalStoreAccess.rawCollection();
    indexesReady = access
      .createIndex(
        { physicalStoreId: 1, subjectType: 1, subjectId: 1 },
        { unique: true }
      )
      .then(() => access.createIndex({ subjectType: 1, subjectId: 1 }))
      .then(() => undefined)
      .catch(error => {
        indexesReady = null;
        throw error;
      });
  }
  return indexesReady;
};

const unionInto = (map: StoreAccessMap, storeId: string, permissions: string[]) => {
  map.set(storeId, [...new Set([...(map.get(storeId) ?? []), ...permissions])]);
};

/**
 * What the user may do on each store they have access to: the permissions
 * given to them on the store plus those given to any group they belong to.
 * Empty for a missing or locked user. A super-admin's access is not listed
 * here (they may do everything on every store): see `storePermissionsOf`.
 */
export async function loadStoreAccessMap(
  user: StoreAccessUser | null | undefined
): Promise<StoreAccessMap> {
  const map: StoreAccessMap = new Map();
  if (!user?._id || user.locked) return map;

  const groupIds = user.groups ?? [];
  const entries = await PhysicalStoreAccess.find({
    $or: [
      { subjectType: 'user', subjectId: user._id },
      ...(groupIds.length > 0
        ? [{ subjectType: 'group' as const, subjectId: { $in: groupIds } }]
        : []),
    ],
  }).fetchAsync();

  entries.forEach(entry => {
    if (entry.permissions.length > 0) {
      unionInto(map, entry.physicalStoreId, entry.permissions);
    }
  });
  return map;
}

/**
 * The user's permissions on one store, from an access map loaded with
 * `loadStoreAccessMap`: every permission for a super-admin, none for a locked
 * or missing user.
 */
export function storePermissionsOf(
  user: StoreAccessUser | null | undefined,
  accessMap: StoreAccessMap,
  physicalStoreId: string
): string[] {
  if (!user?._id || user.locked) return [];
  if (isSuperAdmin(user)) return StorePermissionValues;
  return accessMap.get(physicalStoreId) ?? [];
}

/** True when the user holds at least one of the permissions on the store. */
export async function hasStorePermission(
  user: StoreAccessUser | null | undefined,
  physicalStoreId: string,
  permissions: string[]
): Promise<boolean> {
  if (!user?._id || user.locked) return false;
  if (isSuperAdmin(user)) return true;
  const accessMap = await loadStoreAccessMap(user);
  const held = storePermissionsOf(user, accessMap, physicalStoreId);
  return permissions.some(permission => held.includes(permission));
}

/**
 * True when the user holds at least one of the permissions on any store. For
 * the places that are not about one particular store, such as picking a
 * person for a form.
 */
export async function hasAnyStorePermission(
  user: StoreAccessUser | null | undefined,
  permissions: string[]
): Promise<boolean> {
  if (!user?._id || user.locked) return false;
  if (isSuperAdmin(user)) return true;
  const accessMap = await loadStoreAccessMap(user);
  return [...accessMap.values()].some(held =>
    permissions.some(permission => held.includes(permission))
  );
}

export interface AccessibleStore<TStore> {
  store: TStore;
  permissions: string[];
}

/**
 * The stores the user may open, each with the permissions they hold on it: all
 * stores for a super-admin, else those they hold a permission on.
 */
export async function filterAccessibleStores<TStore extends { _id?: string }>(
  user: StoreAccessUser | null | undefined,
  stores: TStore[]
): Promise<Array<AccessibleStore<TStore>>> {
  if (!user?._id || user.locked) return [];
  const accessMap = await loadStoreAccessMap(user);
  return stores.flatMap(store => {
    const permissions = storePermissionsOf(user, accessMap, store._id as string);
    return permissions.length > 0 ? [{ store, permissions }] : [];
  });
}
