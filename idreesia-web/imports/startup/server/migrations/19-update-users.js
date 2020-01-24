import { Migrations } from 'meteor/percolate:migrations';

import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';

Migrations.add({
  version: 19,
  up() {
    // Currently we have the userId stored on the Karkun entity. Switch this relationship
    // around to have the karkunId stored on the user instead.
    const karkuns = Karkuns.find({ userId: { $exists: true } }).fetch();
    karkuns.forEach(karkun => {
      Meteor.users.update(karkun.userId, {
        $set: {
          karkunId: karkun._id,
        },
      });

      Karkuns.update(karkun._id, {
        $unset: {
          karkunId: '',
        },
      });
    });

    const users = Meteor.users.rawCollection();
    users.createIndex({ permissions: 1 }, { background: true });
    users.createIndex({ instances: 1 }, { background: true });
    users.createIndex({ groups: 1 }, { background: true });
    users.createIndex({ locked: 1 }, { background: true });
    users.createIndex({ karkunId: 1 }, { background: true });
  },
});
