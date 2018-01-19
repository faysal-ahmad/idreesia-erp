import { Mongo } from 'meteor/mongo';

import { ReceivalForm as ReceivalFormSchema } from '../../schemas/inventory';

class ReceivalForms extends Mongo.Collection {
  constructor(name = 'inventory-receival-forms', options = {}) {
    const receivalForms = super(name, options);
    receivalForms.attachSchema(ReceivalFormSchema);
    return receivalForms;
  }
}

export default new ReceivalForms();
