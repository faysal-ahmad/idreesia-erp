import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Karkun as KarkunSchema } from 'meteor/idreesia-common/server/schemas/hr';

class Karkuns extends AggregatableCollection {
  constructor(name = 'hr-karkuns', options = {}) {
    const karkuns = super(name, options);

    karkuns.attachSchema(KarkunSchema);
    return karkuns;
  }
}

export default new Karkuns();
