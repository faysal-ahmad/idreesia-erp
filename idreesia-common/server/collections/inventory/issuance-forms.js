import { endOfDay, startOfDay } from 'date-fns';
import { Formats } from 'meteor/idreesia-common/constants';
import { parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { IssuanceForm as IssuanceFormSchema } from 'meteor/idreesia-common/server/schemas/inventory';

class IssuanceForms extends AggregatableCollection {
  constructor(name = 'inventory-issuance-forms', options = {}) {
    const issuanceForms = super(name, options);
    issuanceForms.attachSchema(IssuanceFormSchema);
    return issuanceForms;
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

export default new IssuanceForms();
