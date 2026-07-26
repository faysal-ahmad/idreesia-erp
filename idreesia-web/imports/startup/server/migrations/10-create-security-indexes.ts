// @ts-nocheck
import { Migrations } from 'meteor/percolate:migrations';

import {
  Visitors,
  VisitorStays,
} from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 10,
  async up() {
    const visitors = Visitors.rawCollection();
    await visitors.createIndex({ name: 'text' });
    await visitors.createIndex({ cnicNumber: 1 }, { background: true });
    await visitors.createIndex({ contactNumber1: 1 }, { background: true });
    await visitors.createIndex({ contactNumber2: 1 }, { background: true });
    await visitors.createIndex({ city: 1 }, { background: true });
    await visitors.createIndex({ country: 1 }, { background: true });

    const visitorStays = VisitorStays.rawCollection();
    await visitorStays.createIndex({ visitorId: 1 }, { background: true });
    await visitorStays.createIndex({ fromDate: 1 }, { background: true });
    await visitorStays.createIndex({ toDate: 1 }, { background: true });
    await visitorStays.createIndex({ stayReason: 1 }, { background: true });
    await visitorStays.createIndex({ stayAllowedBy: 1 }, { background: true });
    await visitorStays.createIndex({ dutyId: 1 }, { background: true });
    await visitorStays.createIndex({ shiftId: 1 }, { background: true });
  },
});
