import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';

export async function getCities(cityIds) {
  const cities = await Cities.find({
    _id: { $in: cityIds },
  }).fetchAsync();

  const citiesMap = keyBy(cities, '_id');
  return cityIds.map(id => citiesMap[id]);
}

export const citiesDataLoader = () => new DataLoader(getCities);
