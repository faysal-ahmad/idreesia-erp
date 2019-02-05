import { assign } from "lodash";

import { AggregatableCollection } from "meteor/idreesia-common/collections";
import { ItemType as ItemTypeSchema } from "meteor/idreesia-common/schemas/inventory";
import { ItemType as ItemTypeModel } from "meteor/idreesia-common/models/inventory";

class ItemTypes extends AggregatableCollection {
  constructor(name = "inventory-item-types", options = {}) {
    const itemTypes = super(
      name,
      assign({}, options, {
        transform(doc) {
          return new ItemTypeModel(doc);
        }
      })
    );

    itemTypes.attachSchema(ItemTypeSchema);
    return itemTypes;
  }
}

export default new ItemTypes();
