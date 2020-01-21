import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Mehfil as MehfilSchema } from 'meteor/idreesia-common/server/schemas/security';

class Mehfils extends AggregatableCollection {
  constructor(name = 'security-mehfils', options = {}) {
    const mehfils = super(name, options);
    mehfils.attachSchema(MehfilSchema);
    return mehfils;
  }
}

export default new Mehfils();
