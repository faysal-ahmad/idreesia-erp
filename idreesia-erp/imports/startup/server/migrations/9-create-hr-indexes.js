import { Migrations } from "meteor/percolate:migrations";

import { Karkuns } from "meteor/idreesia-common/collections/hr";

Migrations.add({
  version: 9,
  up() {
    const karkuns = Karkuns.rawCollection();
    karkuns.createIndex({ city: 1 }, { background: true });
    karkuns.createIndex({ barcode: 1 }, { background: true });
  },
});
