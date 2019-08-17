import { Migrations } from "meteor/percolate:migrations";

import {
  Visitors,
  VisitorStays,
} from "meteor/idreesia-common/collections/security";

Migrations.add({
  version: 10,
  up() {
    const visitors = Visitors.rawCollection();
    visitors.createIndex({ name: "text" });
    visitors.createIndex({ cnicNumber: 1 }, { background: true });
    visitors.createIndex({ contactNumber1: 1 }, { background: true });
    visitors.createIndex({ contactNumber2: 1 }, { background: true });
    visitors.createIndex({ city: 1 }, { background: true });
    visitors.createIndex({ country: 1 }, { background: true });

    const visitorStays = VisitorStays.rawCollection();
    visitorStays.createIndex({ visitorId: 1 }, { background: true });
    visitorStays.createIndex({ fromDate: 1 }, { background: true });
    visitorStays.createIndex({ toDate: 1 }, { background: true });
    visitorStays.createIndex({ stayReason: 1 }, { background: true });
    visitorStays.createIndex({ stayAllowedBy: 1 }, { background: true });
    visitorStays.createIndex({ dutyId: 1 }, { background: true });
    visitorStays.createIndex({ shiftId: 1 }, { background: true });
  },
});
