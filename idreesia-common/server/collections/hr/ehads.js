import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Ehad as EhadSchema } from 'meteor/idreesia-common/server/schemas/hr';

class Ehad extends AggregatableCollection {
  constructor(name = 'hr-ehad', options = {}) {
    const Ehad = super(name, options);
    Ehad.attachSchema(EhadSchema);
    return Ehad;
  }
}

export default new Ehad();
