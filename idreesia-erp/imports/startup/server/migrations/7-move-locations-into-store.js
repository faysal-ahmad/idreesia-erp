import { Migrations } from "meteor/percolate:migrations";
import {
  PhysicalStores,
  Locations,
} from "meteor/idreesia-common/collections/inventory";

Migrations.add({
  version: 7,
  up() {
    const physicalStores = PhysicalStores.find({}).fetch();
    const physicalStore = physicalStores[0];

    const locations = Locations.find({}).fetch();
    locations.forEach(location => {
      Locations.update(location._id, {
        $set: {
          physicalStoreId: physicalStore._id,
        },
      });
    });
  },
});
