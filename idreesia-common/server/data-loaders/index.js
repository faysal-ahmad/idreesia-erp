import {
  attachmentsDataLoader,
  peopleDataLoader,
  usersDataLoader,
} from './common';
import { jobsDataLoader, karkunDutiesDataLoader } from './hr';
import {
  itemCategoriesDataLoader,
  locationsDataLoader,
  physicalStoresDataLoader,
  stockItemsDataLoader,
  vendorsDataLoader,
} from './inventory';
import { citiesDataLoader, cityMehfilsDataLoader } from './outstation';

export function getDataLoaders() {
  return {
    common: {
      attachments: attachmentsDataLoader(),
      people: peopleDataLoader(),
      users: usersDataLoader(),
    },
    hr: {
      jobs: jobsDataLoader(),
      karkunDuties: karkunDutiesDataLoader(),
    },
    inventory: {
      itemCategories: itemCategoriesDataLoader(),
      locations: locationsDataLoader(),
      physicalStores: physicalStoresDataLoader(),
      stockItems: stockItemsDataLoader(),
      vendors: vendorsDataLoader(),
    },
    outstation: {
      cities: citiesDataLoader(),
      cityMehfils: cityMehfilsDataLoader(),
    },
  };
}
