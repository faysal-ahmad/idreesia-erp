import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { People } from 'meteor/idreesia-common/server/collections/common';

export async function getPeople(personIds) {
  const people = await People.find({
    _id: { $in: personIds },
  }).fetchAsync();

  const peopleMap = keyBy(people, '_id');
  return personIds.map(id => peopleMap[id]);
}

export const peopleDataLoader = () => new DataLoader(getPeople);
