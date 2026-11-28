import {
  findMultanCityLocation,
  NO_PICKER_PEOPLE,
  searchPickerPeople,
  type PickerPeopleParams,
} from 'meteor/idreesia-common/server/business-logic/common/people/picker-people';
import { getPredefinedFilterKarkunIds } from 'meteor/idreesia-common/server/business-logic/hr/karkun-search';

export interface StoreKarkunSearchParams extends PickerPeopleParams {
  /** A "recently used" list, e.g. who received goods on the store's forms. */
  predefinedFilterName?: string | null;
  predefinedFilterStoreId?: string | null;
}

/**
 * People to name on a store form (who purchased, received, issued, ...), with
 * only the fields needed to pick a person. With a predefined filter, the
 * people it stands for; otherwise the people of Multan, as in HR.
 */
export async function searchStoreKarkuns({
  predefinedFilterName,
  predefinedFilterStoreId,
  ...params
}: StoreKarkunSearchParams) {
  if (predefinedFilterName) {
    const personIds = await getPredefinedFilterKarkunIds(
      predefinedFilterName,
      predefinedFilterStoreId ?? undefined
    );
    return searchPickerPeople(params, { filter: { personIds }, flags: {} });
  }

  const city = await findMultanCityLocation();
  if (!city) return NO_PICKER_PEOPLE;

  return searchPickerPeople(params, {
    filter: { cityLocationId: city._id as string },
    flags: { includeKarkuns: true, includeEmployees: true, includeVisitors: true },
  });
}
