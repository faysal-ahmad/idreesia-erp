import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { ItemStocks } from '/imports/lib/collections/inventory';

export default new ValidatedMethod({
  name: 'inventory/itemStocks.create',
  validate: null,
  run({ doc }) {
    const { itemTypeId, physicalStoreId } = doc;

    if (ItemStocks.findOne({ itemTypeId, physicalStoreId })) {
      throw new Meteor.Error(
        'not-allowed',
        'A stock for this item type already exists in this store',
        { itemTypeId, physicalStoreId }
      );
    }

    const time = Date.now();
    doc.createdAt = time;
    doc.updatedAt = time;
    return ItemStocks.insert(doc);
  }
});
