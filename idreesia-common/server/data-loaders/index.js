import { attachmentsDataLoader, peopleDataLoader } from './common';
import {
  itemCategoriesDataLoader,
  locationsDataLoader,
  stockItemsDataLoader,
  vendorsDataLoader,
} from './inventory';

export function getDataLoaders() {
  return {
    common: {
      attachments: attachmentsDataLoader(),
      people: peopleDataLoader(),
    },
    inventory: {
      itemCategories: itemCategoriesDataLoader(),
      locations: locationsDataLoader(),
      stockItems: stockItemsDataLoader(),
      vendors: vendorsDataLoader(),
    },
  };
}
