import { Migrations } from 'meteor/quave:migrations';

import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import {
  Committees,
  OrgLocations,
} from 'meteor/idreesia-common/server/collections/admin';

// There are no more central committees: every committee belongs to a location.
// The committees that were central (no location) go under the root location.
Migrations.add({
  version: 70,
  async up() {
    await Committees.rawCollection().createIndex(
      { locationId: 1 },
      { background: true }
    );

    const root = await OrgLocations.findOneAsync({
      type: OrgLocationTypes.ROOT,
    });
    if (!root) {
      throw new Error(
        'The root location is missing; org locations (migration 69) must be created first.'
      );
    }

    await Committees.updateAsync(
      { locationId: null },
      { $set: { locationId: root._id } },
      { multi: true }
    );
  },
});
