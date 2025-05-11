import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { Users } from 'meteor/idreesia-common/server/collections/admin';

export async function getUsers(personIds) {
  const users = await Users.findByPersonIds(personIds);
  const usersMap = keyBy(users, 'personId');
  return personIds.map(id => usersMap[id]);
}

export const usersDataLoader = () => new DataLoader(getUsers);
