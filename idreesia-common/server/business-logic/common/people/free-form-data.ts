import { People } from 'meteor/idreesia-common/server/collections/common';

// The free-text visitor fields an admin can review. Keyed by the name the API
// uses; never build the path from a caller-supplied string.
const FIELD_PATHS = {
  country: 'visitorData.country',
  city: 'visitorData.city',
} as const;

export type FreeFormField = keyof typeof FIELD_PATHS;

export interface FreeFormValuesPage {
  totalResults: number;
  data: Array<{ name: string; count: number }>;
}

interface FacetResult {
  data: Array<{ _id: string; count: number }>;
  total: Array<{ total: number }>;
}

/**
 * The distinct values recorded in a free-text visitor field (people that are
 * not deleted), alphabetical and case-insensitive, each with how many people
 * use it.
 */
export async function pagedFreeFormValues(
  field: FreeFormField,
  pageIndex: number,
  pageSize: number
): Promise<FreeFormValuesPage> {
  const path = FIELD_PATHS[field];
  const limit = Math.max(1, pageSize);
  const skip = Math.max(0, pageIndex) * limit;

  const [result] = await People.aggregate<FacetResult>(
    [
      {
        $match: {
          deletedAt: { $exists: false },
          [path]: { $type: 'string', $ne: '' },
        },
      },
      // Grouped exactly (no collation): spellings that differ only by case
      // are different values here, since they are renamed and mapped as such.
      { $group: { _id: `$${path}`, count: { $sum: 1 } } },
      { $addFields: { sortKey: { $toLower: '$_id' } } },
      { $sort: { sortKey: 1, _id: 1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: 'total' }],
        },
      },
    ]
  );

  return {
    totalResults: result?.total[0]?.total ?? 0,
    data: (result?.data ?? []).map(({ _id, count }) => ({ name: _id, count })),
  };
}
