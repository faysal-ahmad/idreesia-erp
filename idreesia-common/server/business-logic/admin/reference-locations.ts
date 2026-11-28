import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';

/** A location with only what a location picker needs. */
export interface ReferenceLocation {
  _id: string;
  name?: string | null;
  type?: string | null;
  parentId?: string | null;
}

/**
 * The organization locations for a location picker. With `types`, the
 * locations of those types plus their ancestors (so the tree shows where they
 * sit); otherwise every location. The root is left out.
 */
export async function listReferenceLocations(
  types?: string[] | null
): Promise<ReferenceLocation[]> {
  const fields = { _id: 1, name: 1, type: 1, parentId: 1, allParentIds: 1 };
  const all = await OrgLocations.find(
    { type: { $ne: OrgLocationTypes.ROOT } },
    { fields, sort: { name: 1 } }
  ).fetchAsync();

  const wanted =
    types && types.length > 0
      ? all.filter(location => types.includes(location.type as string))
      : all;
  const keep = new Set<string>();
  wanted.forEach(location => {
    keep.add(location._id as string);
    ((location.allParentIds as string[] | undefined) ?? []).forEach(id =>
      keep.add(id)
    );
  });

  return all
    .filter(location => keep.has(location._id as string))
    .map(location => ({
      _id: location._id as string,
      name: location.name,
      type: location.type,
      parentId: location.parentId,
    }));
}
