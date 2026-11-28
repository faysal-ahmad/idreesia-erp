import {
  locationCommitteesDataLoader,
  mehfilTemplateDutiesDataLoader,
  orgLocationsDataLoader,
} from './admin';
import {
  attachmentsDataLoader,
  peopleDataLoader,
  usersDataLoader,
} from './common';
import {
  jobShiftsDataLoader,
  jobsDataLoader,
  karkunTeamsDataLoader,
} from './hr';
import {
  itemCategoriesDataLoader,
  locationsDataLoader,
  physicalStoresDataLoader,
  stockItemsDataLoader,
  vendorsDataLoader,
} from './inventory';
import { citiesDataLoader, cityMehfilsDataLoader } from './outstation';
import {
  purchasingOrdersDataLoader,
  purchasingPettyCashExpenseHeadsDataLoader,
  purchasingPettyCashFundsDataLoader,
  purchasingVendorsDataLoader,
} from './purchasing';

export function getDataLoaders() {
  return {
    admin: {
      locationCommittees: locationCommitteesDataLoader(),
      mehfilTemplateDuties: mehfilTemplateDutiesDataLoader(),
      orgLocations: orgLocationsDataLoader(),
    },
    common: {
      attachments: attachmentsDataLoader(),
      people: peopleDataLoader(),
      users: usersDataLoader(),
    },
    hr: {
      jobs: jobsDataLoader(),
      jobShifts: jobShiftsDataLoader(),
      karkunTeams: karkunTeamsDataLoader(),
    },
    inventory: {
      itemCategories: itemCategoriesDataLoader(),
      locations: locationsDataLoader(),
      physicalStores: physicalStoresDataLoader(),
      stockItems: stockItemsDataLoader(),
      vendors: vendorsDataLoader(),
    },
    purchasing: {
      orders: purchasingOrdersDataLoader(),
      pettyCashExpenseHeads: purchasingPettyCashExpenseHeadsDataLoader(),
      pettyCashFunds: purchasingPettyCashFundsDataLoader(),
      vendors: purchasingVendorsDataLoader(),
    },
    outstation: {
      cities: citiesDataLoader(),
      cityMehfils: cityMehfilsDataLoader(),
    },
  };
}
