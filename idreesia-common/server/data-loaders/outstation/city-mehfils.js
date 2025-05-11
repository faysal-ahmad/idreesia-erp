import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { CityMehfils } from 'meteor/idreesia-common/server/collections/outstation';

export async function getCityMehfils(cityMehfilIds) {
  const cityMehfils = await CityMehfils.find({
    _id: { $in: cityMehfilIds },
  }).fetchAsync();

  const cityMehfilsMap = keyBy(cityMehfils, '_id');
  return cityMehfilIds.map(id => cityMehfilsMap[id]);
}

export const cityMehfilsDataLoader = () => new DataLoader(getCityMehfils);
