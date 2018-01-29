import { Mongo } from 'meteor/mongo';
import { assign } from 'lodash';

import { Profile as ProfileModel } from '/imports/lib/models/admin';
import { Profile as ProfileSchema } from '/imports/lib/schemas/admin';

class Profiles extends Mongo.Collection {
  constructor(name = 'admin-profiles', options = {}) {
    const profiles = super(
      name,
      assign({}, options, {
        transform(doc) {
          return new ProfileModel(doc);
        }
      })
    );

    profiles.attachSchema(ProfileSchema);
    return profiles;
  }
}

export default new Profiles();
