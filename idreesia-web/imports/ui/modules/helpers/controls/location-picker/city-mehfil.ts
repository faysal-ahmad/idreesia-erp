import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';

import type { PickerLocation } from './types';

/** The location types of a karkun's city/mehfil field. */
export const CITY_MEHFIL_TYPES: string[] = [
  OrgLocationTypes.CITY,
  OrgLocationTypes.MEHFIL,
];

/**
 * Splits a picked city or mehfil into the karkun's city and mehfil: a mehfil
 * gives its parent city as well.
 */
export function toCityMehfilIds(
  locationId: string | null | undefined,
  locations: PickerLocation[]
): { cityLocationId?: string; mehfilLocationId?: string | null } {
  if (!locationId) return {};
  const location = locations.find(item => item._id === locationId);
  if (location?.type === OrgLocationTypes.MEHFIL) {
    return {
      cityLocationId: location.parentId ?? undefined,
      mehfilLocationId: location._id,
    };
  }
  return { cityLocationId: locationId, mehfilLocationId: null };
}
