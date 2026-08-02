import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { Users } from 'meteor/idreesia-common/server/collections/admin';

interface UserRecord extends Record<string, unknown> {
  personId?: string;
}

export async function getUsers(personIds: readonly string[]) {
  const users = await Users.findByPersonIds(Array.from(personIds));
  const usersMap = keyBy(users, 'personId') as Record<string, UserRecord>;
  return personIds.map(id => usersMap[id]);
}

export const usersDataLoader = () =>
  new DataLoader<string, UserRecord | undefined>(getUsers);
