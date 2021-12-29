import { Migrations } from 'meteor/percolate:migrations';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  Attendances,
  KarkunDuties,
  Salaries,
} from 'meteor/idreesia-common/server/collections/hr';
import { MehfilKarkuns } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 40,
  up() {
    // Update the karkunId field in Users and also rename to personId
    const users = Users.find({}).fetch();
    users.forEach(user => {
      const karkunId = user.karkunId;
      if (karkunId) {
        const person = People.findOne({ 'karkunData.karkunId': karkunId });
        if (person) {
          Users.update(user._id, {
            $set: {
              personId: person._id,
            },
          });
        }
      }
    });

    // Utility function to update the karkunId references in other collections
    const convertCollection = collection => {
      const records = collection.find({}).fetch();
      records.forEach(record => {
        const karkunId = record.karkunId;
        const person = People.findOne({ 'karkunData.karkunId': karkunId });
        if (!person) {
          console.log(
            `Person not found for collection ${collection._name} against karkunId ${karkunId}`
          );
        } else {
          collection.update(record._id, {
            $set: {
              karkunId: person._id,
            },
          });
        }
      });

      console.log(`${collection._name} converted`);
    };

    convertCollection(Attendances);
    convertCollection(KarkunDuties);
    convertCollection(Salaries);
    convertCollection(MehfilKarkuns);
  },
});
