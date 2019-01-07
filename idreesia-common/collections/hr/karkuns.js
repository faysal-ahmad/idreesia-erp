import { assign } from 'lodash';

import { AggregatableCollection } from 'meteor/idreesia-common/collections';
import { Karkun as KarkunModel } from 'meteor/idreesia-common/models/hr';
import { Karkun as KarkunSchema } from 'meteor/idreesia-common/schemas/hr';

class Karkuns extends AggregatableCollection {
  constructor(name = 'hr-karkuns', options = {}) {
    const karkuns = super(
      name,
      assign({}, options, {
        transform(doc) {
          return new KarkunModel(doc);
        },
      })
    );

    karkuns.attachSchema(KarkunSchema);
    return karkuns;
  }
}

export default new Karkuns();
