import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';

type LoaderRecord = Record<string, unknown>;

export async function getCities(cityIds: readonly string[]) {
  const cities = await Cities.find({
    _id: { $in: cityIds },
  }).fetchAsync();

  const citiesMap = keyBy(cities, '_id') as Record<string, LoaderRecord>;
  return cityIds.map(id => citiesMap[id]);
}

export const citiesDataLoader = () =>
  new DataLoader<string, LoaderRecord | undefined>(getCities);
