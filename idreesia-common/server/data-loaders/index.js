import { attachmentsDataLoader, peopleDataLoader } from './common';
import {
  itemCategoriesDataLoader,
  locationsDataLoader,
  physicalStoresDataLoader,
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
      physicalStores: physicalStoresDataLoader(),
      stockItems: stockItemsDataLoader(),
      vendors: vendorsDataLoader(),
    },
  };
}
