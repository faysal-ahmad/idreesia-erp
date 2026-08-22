import { Migrations } from 'meteor/quave:migrations';
import {
  PhysicalStores,
  ItemCategories,
} from 'meteor/idreesia-common/server/collections/inventory';

Migrations.add({
  version: 6,
  async up() {
    const physicalStores = await PhysicalStores.find({}).fetchAsync();
    const physicalStore = physicalStores[0];

    const itemCategories = await ItemCategories.find({}).fetchAsync();
    for (const itemCategory of itemCategories) {
      await ItemCategories.updateAsync(itemCategory._id, {
        $set: {
          physicalStoreId: physicalStore._id,
        },
      });
    }
  },
});
