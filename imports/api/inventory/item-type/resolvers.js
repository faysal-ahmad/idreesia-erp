import { ItemTypes } from '/imports/lib/collections/inventory';

export default {
  Query: {
    allItemTypes() {
      return ItemTypes.find({}).fetch();
    }
  }
};
