import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { MehfilKarkun as MehfilKarkunSchema } from 'meteor/idreesia-common/server/schemas/security';

class MehfilKarkuns extends AggregatableCollection {
  constructor(name = 'security-mehfil-karkuns', options = {}) {
    super(name, options);
    this.attachSchema(MehfilKarkunSchema);
  }
}

export default new MehfilKarkuns();
