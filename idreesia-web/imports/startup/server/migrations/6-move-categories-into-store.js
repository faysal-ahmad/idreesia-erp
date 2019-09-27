import { Migrations } from 'meteor/percolate:migrations';
import {
  PhysicalStores,
  ItemCategories,
} from 'meteor/idreesia-common/server/collections/inventory';

Migrations.add({
  version: 6,
  up() {
    const physicalStores = PhysicalStores.find({}).fetch();
    const physicalStore = physicalStores[0];

    const itemCategories = ItemCategories.find({}).fetch();
    itemCategories.forEach(itemCategory => {
      ItemCategories.update(itemCategory._id, {
        $set: {
          physicalStoreId: physicalStore._id,
        },
      });
    });
  },
});
