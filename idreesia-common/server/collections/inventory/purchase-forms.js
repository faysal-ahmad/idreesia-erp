import { endOfDay, startOfDay } from 'date-fns';
import { Formats } from 'meteor/idreesia-common/constants';
import { parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PurchaseForm as PurchaseFormSchema } from 'meteor/idreesia-common/server/schemas/inventory';

class PurchaseForms extends AggregatableCollection {
  constructor(name = 'inventory-purchase-forms', options = {}) {
    const purchaseForms = super(name, options);
    purchaseForms.attachSchema(PurchaseFormSchema);
    return purchaseForms;
  }

  async getUpdatedForDate(physicalStoreId, date) {
    return this.find({
      physicalStoreId: { $eq: physicalStoreId },
      updatedAt: {
        $gte: startOfDay(parseDate(date, Formats.DATE_FORMAT)),
        $lte: endOfDay(parseDate(date, Formats.DATE_FORMAT)),
      },
    }).fetchAsync();
  }
}

export default new PurchaseForms();
