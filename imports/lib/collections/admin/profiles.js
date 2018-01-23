import { Mongo } from 'meteor/mongo';

import { Profile as ProfileSchema } from '/imports/lib/schemas/admin';

class Profiles extends Mongo.Collection {
  constructor(name = 'admin-Profiles', options = {}) {
    const profiles = super(name, options);
    profiles.attachSchema(ProfileSchema);
    return profiles;
  }
}

export default new Profiles();
