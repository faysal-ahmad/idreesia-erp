import {
  OrgLocationAllowedChildTypes,
  OrgLocationTypes,
  type OrgLocationType,
} from 'meteor/idreesia-common/constants/organization';

export const ORG_LOCATION_TYPE_LABELS: Record<OrgLocationType, string> = {
  [OrgLocationTypes.ROOT]: 'Root',
  [OrgLocationTypes.COUNTRY]: 'Country',
  [OrgLocationTypes.GROUP]: 'Zone / Group',
  [OrgLocationTypes.CITY]: 'City',
  [OrgLocationTypes.MEHFIL]: 'Mehfil',
};

// antd preset Tag colors, one per type.
export const ORG_LOCATION_TYPE_COLORS: Record<OrgLocationType, string> = {
  [OrgLocationTypes.ROOT]: 'default',
  [OrgLocationTypes.COUNTRY]: 'purple',
  [OrgLocationTypes.GROUP]: 'orange',
  [OrgLocationTypes.CITY]: 'blue',
  [OrgLocationTypes.MEHFIL]: 'green',
};

export interface LocationRecord {
  _id: string;
  name: string;
  type: OrgLocationType;
  parentId?: string | null;
  allParentIds: string[];
  /** The committees made under this location. */
  committees: { _id: string; name: string }[];
  /** How many karkuns observe this location. */
  observerCount: number;
}

/** Types that may be the parent of a location of the given type. */
export const getAllowedParentTypes = (type: OrgLocationType) =>
  (Object.keys(OrgLocationAllowedChildTypes) as OrgLocationType[]).filter(
    parentType => OrgLocationAllowedChildTypes[parentType].includes(type)
  );

/** "Idreesia > Pakistan > Zone A" style path for a location. */
export const getLocationPath = (
  location: LocationRecord,
  byId: Map<string, LocationRecord>
) =>
  [...location.allParentIds, location._id]
    .map(id => byId.get(id)?.name)
    .filter(Boolean)
    .join(' > ');

export interface ParentCascaderOption {
  value: string;
  label: string;
  children?: ParentCascaderOption[];
}

/**
 * The locations a location of the given type can be placed under, as a
 * cascader tree. `excludeId` leaves out a location being edited and
 * everything inside it. Branches with nowhere the type can go are left out.
 * Types that cannot be the parent still appear as stepping stones; picking
 * one fails `validateParentPath`.
 */
export const buildParentCascaderOptions = (
  locations: LocationRecord[],
  type: OrgLocationType,
  excludeId?: string
): ParentCascaderOption[] => {
  const allowed = getAllowedParentTypes(type);

  const childrenOf = new Map<string | null, LocationRecord[]>();
  locations
    .filter(
      l => !excludeId || (l._id !== excludeId && !l.allParentIds.includes(excludeId))
    )
    .forEach(l => {
      const key = l.parentId ?? null;
      childrenOf.set(key, [...(childrenOf.get(key) ?? []), l]);
    });

  const build = (parentId: string | null): ParentCascaderOption[] =>
    (childrenOf.get(parentId) ?? [])
      .sort((a, b) => a.name.localeCompare(b.name))
      .flatMap(l => {
        const children = build(l._id);
        if (!allowed.includes(l.type) && children.length === 0) return [];
        return [
          {
            value: l._id,
            label: l.name,
            ...(children.length ? { children } : {}),
          },
        ];
      });
  return build(null);
};

/** The cascader value for a parent: the path from the top down to it. */
export const toParentPath = (
  parentId: string | null | undefined,
  byId: Map<string, LocationRecord>
) => {
  const parent = parentId ? byId.get(parentId) : undefined;
  return parent ? [...parent.allParentIds, parent._id] : undefined;
};

/** The parent a cascader path selects: its last location. */
export const parentIdFromPath = (path?: string[] | null) =>
  path?.length ? path[path.length - 1] : null;

/** Rejects a path that ends at a location the type cannot be placed under. */
export const validateParentPath = (
  type: OrgLocationType | undefined,
  byId: Map<string, LocationRecord>,
  path?: string[]
) => {
  const parentId = parentIdFromPath(path);
  const parent = parentId ? byId.get(parentId) : undefined;
  if (!parent || !type || getAllowedParentTypes(type).includes(parent.type)) {
    return Promise.resolve();
  }
  return Promise.reject(
    new Error(
      `A ${ORG_LOCATION_TYPE_LABELS[type]} cannot be placed under a ${ORG_LOCATION_TYPE_LABELS[parent.type]}.`
    )
  );
};
