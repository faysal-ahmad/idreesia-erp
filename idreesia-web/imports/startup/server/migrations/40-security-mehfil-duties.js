import { Migrations } from 'meteor/percolate:migrations';
import { MehfilDuties as MehfilDutiesList } from 'meteor/idreesia-common/constants/security';
import {
  MehfilDuties,
  MehfilKarkuns,
} from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 40,
  up() {
    // Insert the existing mehfil duties defined as constants into
    // the collection. Also update the mehfil karkuns to point to
    // these new duties in the collection.
    const adminUser = Meteor.users.findOne({
      username: 'erp-admin',
    });
    const date = new Date();
    MehfilDutiesList.forEach(mehfilDuty => {
      const newMehfilDutyId = MehfilDuties.insert({
        name: mehfilDuty.name,
        urduName: mehfilDuty.urduName,
        createdAt: date,
        createdBy: adminUser._id,
        updatedAt: date,
        updatedBy: adminUser._id,
      });

      MehfilKarkuns.update(
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
    });
  },
});
