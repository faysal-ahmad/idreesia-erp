import { Migrations } from 'meteor/quave:migrations';

import { TrustedDevices } from 'meteor/idreesia-common/server/collections/admin';

Migrations.add({
  version: 76,
  async up() {
    const trustedDevices = TrustedDevices.rawCollection();
    // A user's devices, for the list and the per-user limit.
    await trustedDevices.createIndex({ userId: 1 }, { background: true });
    // Deletes each device once it has expired, or been revoked for a while.
    await trustedDevices.createIndex(
      { removeAt: 1 },
      { background: true, expireAfterSeconds: 0 }
    );
  },
});
