import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { MehfilKarkun as MehfilKarkunSchema } from 'meteor/idreesia-common/server/schemas/security';

class MehfilKarkuns extends AggregatableCollection {
  constructor(name = 'security-mehfil-karkuns', options = {}) {
    const mehfilKarkuns = super(name, options);
    mehfilKarkuns.attachSchema(MehfilKarkunSchema);
    return mehfilKarkuns;
  }
}

export default new MehfilKarkuns();
