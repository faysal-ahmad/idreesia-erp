import { Mongo } from 'meteor/mongo';
import { assign } from 'lodash';

import { Karkun as KarkunModel } from '/imports/lib/models/hr';
import { Karkun as KarkunSchema } from '/imports/lib/schemas/hr';

class Karkuns extends Mongo.Collection {
  constructor(name = 'hr-karkuns', options = {}) {
    const karkuns = super(
      name,
      assign({}, options, {
        transform(doc) {
          return new KarkunModel(doc);
        }
      })
    );

    karkuns.attachSchema(KarkunSchema);
    return karkuns;
  }
}

export default new Karkuns();
