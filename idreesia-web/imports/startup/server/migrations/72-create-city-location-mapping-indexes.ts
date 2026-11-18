import { Migrations } from 'meteor/quave:migrations';

import { CityLocationMappings } from 'meteor/idreesia-common/server/collections/admin';

Migrations.add({
  version: 72,
  async up() {
    // A free-form city maps to at most one location.
    await CityLocationMappings.rawCollection().createIndex(
      { city: 1 },
      { unique: true, background: true }
    );
  },
});
