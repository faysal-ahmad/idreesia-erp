import moment from 'moment';
import { Formats } from 'meteor/idreesia-common/constants';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { IssuanceForm as IssuanceFormSchema } from 'meteor/idreesia-common/server/schemas/inventory';

class IssuanceForms extends AggregatableCollection {
  constructor(name = 'inventory-issuance-forms', options = {}) {
    const issuanceForms = super(name, options);
    issuanceForms.attachSchema(IssuanceFormSchema);
    return issuanceForms;
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

export default new IssuanceForms();
