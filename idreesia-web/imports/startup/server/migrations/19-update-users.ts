import { Migrations } from 'meteor/quave:migrations';

import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';

Migrations.add({
  version: 19,
  async up() {
    // Currently we have the userId stored on the Karkun entity. Switch this relationship
    // around to have the karkunId stored on the user instead.
    const karkuns = await Karkuns.find({ userId: { $exists: true } }).fetchAsync();
    for (const karkun of karkuns) {
      await Meteor.users.updateAsync(karkun.userId, {
        $set: {
          karkunId: karkun._id,
        },
      });

      await Karkuns.updateAsync(karkun._id, {
        $unset: {
          karkunId: '',
        },
      });
    }

    const users = Meteor.users.rawCollection();
    await users.createIndex({ permissions: 1 }, { background: true });
    await users.createIndex({ instances: 1 }, { background: true });
    await users.createIndex({ groups: 1 }, { background: true });
    await users.createIndex({ locked: 1 }, { background: true });
    await users.createIndex({ karkunId: 1 }, { background: true });
  },
});
