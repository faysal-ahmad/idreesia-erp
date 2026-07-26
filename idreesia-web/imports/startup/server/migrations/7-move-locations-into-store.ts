import { Migrations } from 'meteor/percolate:migrations';
import {
  PhysicalStores,
  Locations,
} from 'meteor/idreesia-common/server/collections/inventory';

Migrations.add({
  version: 7,
  async up() {
    const physicalStores = await PhysicalStores.find({}).fetchAsync();
    const physicalStore = physicalStores[0];

    const locations = await Locations.find({}).fetchAsync();
    for (const location of locations) {
      await Locations.updateAsync(location._id, {
        $set: {
          physicalStoreId: physicalStore._id,
        },
      });
    }
  },
});
