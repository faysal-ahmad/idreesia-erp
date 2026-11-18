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
