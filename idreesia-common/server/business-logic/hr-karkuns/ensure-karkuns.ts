import { People } from 'meteor/idreesia-common/server/collections/common';

export async function ensureKarkuns(
  ids: Array<string | null | undefined>
) {
  const unique = [...new Set(ids.filter((id): id is string => !!id))];
  if (unique.length === 0) return;

  const people = await People.find({
    _id: { $in: unique },
  }).fetchAsync();
  const valid = new Set(
    people.filter(person => person.isKarkun).map(person => person._id)
  );
  if (unique.some(id => !valid.has(id))) {
    throw new Error('Please select a valid karkun.');
  }
}
