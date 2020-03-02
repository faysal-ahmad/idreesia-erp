import { Migrations } from 'meteor/percolate:migrations';

import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';

Migrations.add({
  version: 28,
  up() {
    const user = Meteor.users.findOne({ username: 'erp-admin' });
    let multanCity = Cities.findOne({ name: 'Multan', country: 'Pakistan' });
    if (!multanCity) {
      const date = new Date();
      const multanCityId = Cities.insert({
        name: 'Multan',
        country: 'Pakistan',
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      multanCity = Cities.findOne(multanCityId);
    }

    // Remove the dummy 'Pindaal Incharge' karkun
    Karkuns.remove({ name: 'Pindaal Incharge' });

    Karkuns.update(
      { cityId: { $exists: false } },
      {
        $set: {
          cityId: multanCity._id,
        },
      },
      { multi: true }
    );

    const date = new Date();
    const msKarkuns = Karkuns.find({ cityId: multanCity._id }).fetch();
    msKarkuns.forEach(karkun => {
      if (
        karkun.parentName &&
        karkun.cnicNumber &&
        karkun.contactNumber1 &&
        karkun.ehadDate &&
        karkun.referenceName &&
        !Visitors.isCnicInUse(karkun.cnicNumber) &&
        !Visitors.isContactNumberInUse(karkun.contactNumber1)
      ) {
        let updateImageId = null;
        if (karkun.imageId) {
          const image = Attachments.findOne(karkun.imageId);
          updateImageId = Attachments.insert({
            name: image.name,
            description: image.description,
            mimeType: image.mimeType,
            data: image.data,
            createdAt: date,
            createdBy: user._id,
            updatedAt: date,
            updatedBy: user._id,
          });
        }

        Visitors.insert({
          karkunId: karkun._id,
          name: karkun.name,
          parentName: karkun.parentName,
          cnicNumber: karkun.cnicNumber,
          contactNumber1: karkun.contactNumber1,
          contactNumber2: karkun.contactNumber2,
          city: 'Multan',
          country: 'Pakistan',
          ehadDate: karkun.ehadDate,
          birthDate: karkun.birthDate,
          referenceName: karkun.referenceName,
          imageId: updateImageId,
          createdAt: date,
          createdBy: user._id,
          updatedAt: date,
          updatedBy: user._id,
        });
      }
    });
  },
});
