import { Migrations } from 'meteor/quave:migrations';
import { SecurityEventDuties as SecurityEventDutiesList } from 'meteor/idreesia-common/constants/security';
import {
  SecurityEventDuties,
  SecurityEventKarkuns,
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
    for (const mehfilDuty of SecurityEventDutiesList) {
      const newMehfilDutyId = await SecurityEventDuties.insertAsync({
        name: mehfilDuty.name,
        urduName: mehfilDuty.urduName,
        createdAt: date,
        createdBy: adminUser._id,
        updatedAt: date,
        updatedBy: adminUser._id,
      });

      await SecurityEventKarkuns.updateAsync(
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
