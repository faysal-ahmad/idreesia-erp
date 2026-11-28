import { Migrations } from 'meteor/quave:migrations';

import {
  CityLocationMappings,
  LoginAttempts,
  TrustedDevices,
  Users,
} from 'meteor/idreesia-common/server/collections/admin';
import {
  AuditLogs,
  Notifications,
} from 'meteor/idreesia-common/server/collections/common';
import {
  Cities,
  CityMehfils,
} from 'meteor/idreesia-common/server/collections/outstation';

Migrations.add({
  version: 2,
  name: 'Create admin and common indexes',
  async up() {
    const users = Users.rawCollection();
    await users.createIndex({ permissions: 1 }, { background: true });
    await users.createIndex({ groups: 1 }, { background: true });
    await users.createIndex({ locked: 1 }, { background: true });
    await users.createIndex({ updatedAt: 1 }, { background: true });
    await users.createIndex({ personId: 1 }, { background: true });
    // Discussions map each message's chat sender back to the ERP user (and
    // from there to the person's profile image) by chatUserId. Only users
    // with a chat account have the field, hence sparse.
    await users.createIndex(
      { chatUserId: 1 },
      { background: true, sparse: true }
    );

    const loginAttempts = LoginAttempts.rawCollection();
    // An account's attempts across addresses, for its cap and status.
    await loginAttempts.createIndex(
      { userId: 1, lastAttemptAt: 1 },
      { background: true }
    );
    // Drops each document once its count is forgotten or its trust ends.
    await loginAttempts.createIndex(
      { expiresAt: 1 },
      { background: true, expireAfterSeconds: 0 }
    );

    const trustedDevices = TrustedDevices.rawCollection();
    // A user's devices, for the list and the per-user limit.
    await trustedDevices.createIndex({ userId: 1 }, { background: true });
    // Deletes each device once it has expired, or been revoked for a while.
    await trustedDevices.createIndex(
      { removeAt: 1 },
      { background: true, expireAfterSeconds: 0 }
    );

    const auditLogs = AuditLogs.rawCollection();
    await auditLogs.createIndex({ entityId: 1 }, { background: true });
    await auditLogs.createIndex({ entityType: 1 }, { background: true });
    await auditLogs.createIndex({ operationType: 1 }, { background: true });
    await auditLogs.createIndex({ operationTime: 1 }, { background: true });
    await auditLogs.createIndex({ operationBy: 1 }, { background: true });

    const notifications = Notifications.rawCollection();
    // A user's notifications: by committee and module, newest change first.
    await notifications.createIndex(
      { committeeId: 1, module: 1, updatedAt: -1 },
      { background: true }
    );
    // The purge: expired ones and ones past the retention period.
    await notifications.createIndex({ expiresAt: 1 }, { background: true });
    await notifications.createIndex({ updatedAt: 1 }, { background: true });

    const cities = Cities.rawCollection();
    await cities.createIndex({ region: 1 }, { background: true });
    await cities.createIndex({ country: 1 }, { background: true });

    await CityMehfils.rawCollection().createIndex(
      { cityId: 1 },
      { background: true }
    );

    // A free-form city maps to at most one location.
    await CityLocationMappings.rawCollection().createIndex(
      { city: 1 },
      { unique: true, background: true }
    );
  },
});
