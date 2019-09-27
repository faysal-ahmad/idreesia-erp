import { Migrations } from 'meteor/percolate:migrations';

import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';

Migrations.add({
  version: 14,
  up() {
    Karkuns.rawCollection().dropIndex('firstName_text_lastName_text');
    Karkuns.rawCollection().createIndex({
      name: 'text',
      currentAddress: 'text',
      permanentAddress: 'text',
    });

    const karkuns = Karkuns.find({}).fetch();
    karkuns.forEach(karkun => {
      Karkuns.update(karkun._id, {
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
    });
  },
});
