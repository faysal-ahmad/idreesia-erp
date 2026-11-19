export const OrgLocationTypes = {
  ROOT: 'root',
  COUNTRY: 'country',
  GROUP: 'group',
  CITY: 'city',
  MEHFIL: 'mehfil',
} as const;

export type OrgLocationType =
  (typeof OrgLocationTypes)[keyof typeof OrgLocationTypes];

export const OrgLocationTypeValues: OrgLocationType[] =
  Object.values(OrgLocationTypes);

/**
 * Which location types may be placed directly under each type. Groups (zones)
 * can nest. A group can sit under a country or another group.
 */
export const OrgLocationAllowedChildTypes: Record<
  OrgLocationType,
  OrgLocationType[]
> = {
  [OrgLocationTypes.ROOT]: [OrgLocationTypes.COUNTRY],
  [OrgLocationTypes.COUNTRY]: [OrgLocationTypes.GROUP, OrgLocationTypes.CITY],
  [OrgLocationTypes.GROUP]: [OrgLocationTypes.GROUP, OrgLocationTypes.CITY],
  [OrgLocationTypes.CITY]: [OrgLocationTypes.MEHFIL],
  [OrgLocationTypes.MEHFIL]: [],
};
