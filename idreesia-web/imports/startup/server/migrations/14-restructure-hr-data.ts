// @ts-nocheck
import { Migrations } from 'meteor/percolate:migrations';

import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';

Migrations.add({
  version: 14,
  async up() {
    await Karkuns.rawCollection().dropIndex('firstName_text_lastName_text');
    await Karkuns.rawCollection().createIndex({
      name: 'text',
      currentAddress: 'text',
      permanentAddress: 'text',
    });

    const karkuns = await Karkuns.find({}).fetchAsync();
    for (const karkun of karkuns) {
      await Karkuns.updateAsync(karkun._id, {
        $set: {
          name: `${karkun.firstName || ''} ${karkun.lastName || ''}`,
          permanentAddress: karkun.address,
        },
        $unset: {
          firstName: '',
          lastName: '',
          address: '',
          city: '',
          country: '',
          profilePicture: '',
          barcode: '',
        },
      });
    }
  },
});
