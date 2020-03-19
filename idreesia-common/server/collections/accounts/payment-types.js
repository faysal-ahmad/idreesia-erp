import { Mongo } from 'meteor/mongo';

import { PaymentType as PaymentTypeSchema } from 'meteor/idreesia-common/server/schemas/accounts';

class PaymentTypes extends Mongo.Collection {
  constructor(name = 'accounts-payment-types', options = {}) {
    const paymentTypes = super(name, options);
    paymentTypes.attachSchema(PaymentTypeSchema);
    return paymentTypes;
  }
}

export default new PaymentTypes();
