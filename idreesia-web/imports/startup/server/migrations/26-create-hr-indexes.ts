import { Migrations } from 'meteor/quave:migrations';

// Karkuns collection has since been removed - its data now lives on People.
// import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';

Migrations.add({
  version: 26,
  async up() {
    // const karkuns = Karkuns.rawCollection();
    // await karkuns.createIndex({ ehadDate: 1 }, { background: true });
    // await karkuns.createIndex({ lastTarteebDate: 1 }, { background: true });
  },
});
