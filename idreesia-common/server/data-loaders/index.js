import { attachmentsDataLoader, peopleDataLoader } from './common';
import { locationsDataLoader, vendorsDataLoader } from './inventory';

export function getDataLoaders() {
  return {
    common: {
      attachments: attachmentsDataLoader(),
      people: peopleDataLoader(),
    },
    inventory: {
      locations: locationsDataLoader(),
      vendors: vendorsDataLoader(),
    },
  };
}
