import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Mehfil as MehfilSchema } from 'meteor/idreesia-common/server/schemas/security';

class Mehfils extends AggregatableCollection {
  constructor(name = 'security-mehfils', options = {}) {
    super(name, options);
    this.attachSchema(MehfilSchema);
  }
}

export default new Mehfils();
