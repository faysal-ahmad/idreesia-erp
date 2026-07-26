import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { People } from 'meteor/idreesia-common/server/collections/common';

type LoaderRecord = Record<string, unknown>;

export async function getPeople(personIds: readonly string[]) {
  const people = await People.find({
    _id: { $in: personIds },
  }).fetchAsync();

  const peopleMap = keyBy(people, '_id') as Record<string, LoaderRecord>;
  return personIds.map(id => peopleMap[id]);
}

export const peopleDataLoader = () =>
  new DataLoader<string, LoaderRecord | undefined>(getPeople);
