import { Mongo } from 'meteor/mongo';
import { assign } from 'lodash';

import { Profile as ProfileModel } from 'meteor/idreesia-common/models/admin';
import { Profile as ProfileSchema } from 'meteor/idreesia-common/schemas/admin';

class Profiles extends Mongo.Collection {
  constructor(name = 'admin-profiles', options = {}) {
    const profiles = super(
      name,
      assign({}, options, {
        transform(doc) {
          return new ProfileModel(doc);
        },
      })
    );

    profiles.attachSchema(ProfileSchema);
    return profiles;
  }
}

export default new Profiles();
