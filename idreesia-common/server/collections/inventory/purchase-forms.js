import moment from 'moment';
import { Formats } from 'meteor/idreesia-common/constants';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PurchaseForm as PurchaseFormSchema } from 'meteor/idreesia-common/server/schemas/inventory';

class PurchaseForms extends AggregatableCollection {
  constructor(name = 'inventory-purchase-forms', options = {}) {
    const purchaseForms = super(name, options);
    purchaseForms.attachSchema(PurchaseFormSchema);
    return purchaseForms;
  }

  getUpdatedForDate(physicalStoreId, date) {
    return this.find({
      physicalStoreId: { $eq: physicalStoreId },
      updatedAt: {
        $gte: moment(date, Formats.DATE_FORMAT)
          .startOf('day')
          .toDate(),
        $lte: moment(date, Formats.DATE_FORMAT)
          .endOf('day')
          .toDate(),
      },
    }).fetch();
  }
}

export default new PurchaseForms();
