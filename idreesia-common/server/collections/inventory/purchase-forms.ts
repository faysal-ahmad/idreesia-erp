import { endOfDay, startOfDay } from 'date-fns';
import { Formats } from 'meteor/idreesia-common/constants';
import { parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PurchaseForm as PurchaseFormSchema } from 'meteor/idreesia-common/server/schemas/inventory';

interface PurchaseFormDocument {
  _id?: string;
  physicalStoreId?: string;
  updatedAt?: Date;
  [key: string]: unknown;
}

class PurchaseForms extends AggregatableCollection<PurchaseFormDocument> {
  constructor(name = 'inventory-purchase-forms', options = {}) {
    super(name, options);
    this.attachSchema(PurchaseFormSchema);
  }

  async getUpdatedForDate(physicalStoreId: string, date: string) {
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
