import { Migrations } from 'meteor/quave:migrations';
import { MehfilDuties as MehfilDutiesList } from 'meteor/idreesia-common/constants/security';
import {
  MehfilDuties,
  MehfilKarkuns,
} from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 40,
  async up() {
    // Insert the existing mehfil duties defined as constants into
    // the collection. Also update the mehfil karkuns to point to
    // these new duties in the collection.
    const adminUser = await Meteor.users.findOneAsync({
      username: 'erp-admin',
    });
    if (!adminUser) throw new Error('Admin user not found.');
    const date = new Date();
    for (const mehfilDuty of MehfilDutiesList) {
      const newMehfilDutyId = await MehfilDuties.insertAsync({
        name: mehfilDuty.name,
        urduName: mehfilDuty.urduName,
        createdAt: date,
        createdBy: adminUser._id,
        updatedAt: date,
        updatedBy: adminUser._id,
      });

      await MehfilKarkuns.updateAsync(
        {
          dutyName: mehfilDuty._id,
        },
        {
          $set: {
            dutyId: newMehfilDutyId,
          },
          $unset: {
            dutyName: '',
          },
        },
        { multi: true }
      );
    }
  },
});
