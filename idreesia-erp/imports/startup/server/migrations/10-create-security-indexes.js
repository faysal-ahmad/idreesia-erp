import { Migrations } from "meteor/percolate:migrations";

import { Visitors } from "meteor/idreesia-common/collections/security";

Migrations.add({
  version: 10,
  up() {
    const visitors = Visitors.rawCollection();
    visitors.createIndex({
      firstName: "text",
      lastName: "text",
    });
    visitors.createIndex({ cnicNumber: 1 }, { background: true });
    visitors.createIndex({ contactNumber1: 1 }, { background: true });
    visitors.createIndex({ contactNumber2: 1 }, { background: true });
  },
});
