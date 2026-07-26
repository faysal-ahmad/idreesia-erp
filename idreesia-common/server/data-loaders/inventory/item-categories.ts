import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { ItemCategories } from 'meteor/idreesia-common/server/collections/inventory';

type LoaderRecord = Record<string, unknown>;

export async function getItemCategories(itemCategoryIds: readonly string[]) {
  const itemCategories = await ItemCategories.find({
    _id: { $in: itemCategoryIds },
  }).fetchAsync();

  const itemCategoriesMap = keyBy(itemCategories, '_id') as Record<
    string,
    LoaderRecord
  >;
  return itemCategoryIds.map(id => itemCategoriesMap[id]);
}

export const itemCategoriesDataLoader = () =>
  new DataLoader<string, LoaderRecord | undefined>(getItemCategories);
