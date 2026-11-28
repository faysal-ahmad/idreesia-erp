import { People } from 'meteor/idreesia-common/server/collections/common';

interface NamedUser {
  personId?: string;
  profile?: { name?: string };
}

/**
 * The name to show for each user: the account's own name, or the name of the
 * person (karkun) the account belongs to when the account has none. Returns a
 * function from a user to its name.
 */
export async function userNameResolver(users: NamedUser[]) {
  const personIds = [
    ...new Set(
      users.filter((user) => !user.profile?.name && user.personId).map((user) => user.personId as string)
    ),
  ];
  const people = personIds.length
    ? await People.find({ _id: { $in: personIds } }, { fields: { 'sharedData.name': 1 } }).fetchAsync()
    : [];
  const personNames = new Map(people.map((person) => [person._id as string, person.sharedData?.name]));

  return (user: NamedUser): string | undefined =>
    user.profile?.name || (user.personId ? personNames.get(user.personId) : undefined) || undefined;
}
