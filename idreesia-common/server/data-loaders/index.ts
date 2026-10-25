import {
  attachmentsDataLoader,
  peopleDataLoader,
  usersDataLoader,
} from './common';
import { jobsDataLoader, karkunTeamsDataLoader } from './hr';
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
      karkunTeams: karkunTeamsDataLoader(),
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
