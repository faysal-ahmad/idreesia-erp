import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { ItemStocks } from '/imports/lib/collections/inventory';

export default new ValidatedMethod({
  name: 'inventory/itemStocks.update',
  validate: null,
  run({ doc }) {
    delete doc._id;
    delete doc.currentStockLevel;
    doc.updatedAt = Date.now();
    return ItemStocks.update(_id, { $set: doc });
  }
});
