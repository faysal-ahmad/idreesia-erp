import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { ItemCategories } from 'meteor/idreesia-common/server/collections/inventory';

export async function getItemCategories(itemCategoryIds) {
  const itemCategories = await ItemCategories.find({
    _id: { $in: itemCategoryIds },
  }).fetchAsync();

  const itemCategoriesMap = keyBy(itemCategories, '_id');
  return itemCategoryIds.map(id => itemCategoriesMap[id]);
}

export const itemCategoriesDataLoader = () => new DataLoader(getItemCategories);
