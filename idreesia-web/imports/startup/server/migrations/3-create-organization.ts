import { Migrations } from 'meteor/quave:migrations';

import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import {
  Committees,
  OrgLocations,
} from 'meteor/idreesia-common/server/collections/admin';
import { ensureOrgLocationUserIndexes } from 'meteor/idreesia-common/server/business-logic/admin';

// The org-locations tree (root > country > [zone] > city > mehfil) and the
// committees that belong to its locations. Seeds the root location, which
// everything else hangs under.
Migrations.add({
  version: 3,
  name: 'Create the organization',
  async up() {
    const locations = OrgLocations.rawCollection();
    await locations.createIndex({ parentId: 1 }, { background: true });
    await locations.createIndex({ allParentIds: 1 }, { background: true });
    await ensureOrgLocationUserIndexes();

    const committees = Committees.rawCollection();
    await committees.createIndex({ 'members.karkunId': 1 });
    await committees.createIndex({ locationId: 1 }, { background: true });

    const root = await OrgLocations.findOneAsync({
      type: OrgLocationTypes.ROOT,
    });
    if (!root) {
      const date = new Date();
      await OrgLocations.insertAsync({
        name: 'Idreesia',
        type: OrgLocationTypes.ROOT,
        parentId: null,
        allParentIds: [],
        createdAt: date,
        updatedAt: date,
      });
    }
  },
});
