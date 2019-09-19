import { AggregatableCollection } from 'meteor/idreesia-common/collections';
import { Karkun as KarkunSchema } from 'meteor/idreesia-common/schemas/hr';

class Karkuns extends AggregatableCollection {
  constructor(name = 'hr-karkuns', options = {}) {
    const karkuns = super(name, options);

    karkuns.attachSchema(KarkunSchema);
    return karkuns;
  }
}

export default new Karkuns();
