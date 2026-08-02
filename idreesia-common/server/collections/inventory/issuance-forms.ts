import { endOfDay, startOfDay } from 'date-fns';
import { Formats } from 'meteor/idreesia-common/constants';
import { parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { IssuanceForm as IssuanceFormSchema } from 'meteor/idreesia-common/server/schemas/inventory';

interface IssuanceFormDocument {
  _id?: string;
  physicalStoreId?: string;
  updatedAt?: Date;
  [key: string]: unknown;
}

class IssuanceForms extends AggregatableCollection<IssuanceFormDocument> {
  constructor(name = 'inventory-issuance-forms', options = {}) {
    super(name, options);
    this.attachSchema(IssuanceFormSchema);
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

export default new IssuanceForms();
