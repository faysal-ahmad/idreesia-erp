import { Migrations } from 'meteor/quave:migrations';

import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';

Migrations.add({
  version: 28,
  async up() {
    const user = await Meteor.users.findOneAsync({ username: 'erp-admin' });
    if (!user) throw new Error('Admin user not found.');
    let multanCity = await Cities.findOneAsync({ name: 'Multan', country: 'Pakistan' });
    if (!multanCity) {
      const date = new Date();
      const multanCityId = await Cities.insertAsync({
        name: 'Multan',
        country: 'Pakistan',
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      multanCity = await Cities.findOneAsync(multanCityId);
    }
    if (!multanCity) throw new Error('Multan city not found.');

    // Remove the dummy 'Pindaal Incharge' karkun
    await Karkuns.removeAsync({ name: 'Pindaal Incharge' });

    await Karkuns.updateAsync(
      { cityId: { $exists: false } },
      {
        $set: {
          cityId: multanCity._id,
        },
      },
      { multi: true }
    );

    const date = new Date();
    const msKarkuns = await Karkuns.find({ cityId: multanCity._id }).fetchAsync();
    for (const karkun of msKarkuns) {
      if (
        karkun.parentName &&
        karkun.cnicNumber &&
        karkun.contactNumber1 &&
        karkun.ehadDate &&
        karkun.referenceName &&
        !(await Visitors.isCnicInUse(karkun.cnicNumber)) &&
        !(await Visitors.isContactNumberInUse(karkun.contactNumber1))
      ) {
        let updateImageId = null;
        if (karkun.imageId) {
          const image = await Attachments.findOneAsync(karkun.imageId);
          if (!image) continue;
          updateImageId = await Attachments.insertAsync({
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

        await Visitors.insertAsync({
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
    }
  },
});
