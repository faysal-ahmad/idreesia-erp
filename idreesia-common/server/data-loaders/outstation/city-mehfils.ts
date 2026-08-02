import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { CityMehfils } from 'meteor/idreesia-common/server/collections/outstation';

type LoaderRecord = Record<string, unknown>;

export async function getCityMehfils(cityMehfilIds: readonly string[]) {
  const cityMehfils = await CityMehfils.find({
    _id: { $in: cityMehfilIds },
  }).fetchAsync();

  const cityMehfilsMap = keyBy(cityMehfils, '_id') as Record<
    string,
    LoaderRecord
  >;
  return cityMehfilIds.map(id => cityMehfilsMap[id]);
}

export const cityMehfilsDataLoader = () =>
  new DataLoader<string, LoaderRecord | undefined>(getCityMehfils);
