import { Migrations } from 'meteor/quave:migrations';

import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';

// The boolean "Attendance Geofencing" becomes a radius in meters. A mehfil
// that had it on gets 100 meters; the old field goes away either way.
Migrations.add({
  version: 74,
  async up() {
    const raw = OrgLocations.rawCollection();
    await raw.updateMany(
      { 'mehfilDetails.attendanceGeofencing': true },
      { $set: { 'mehfilDetails.attendanceGeofenceMeters': 100 } }
    );
    await raw.updateMany(
      { 'mehfilDetails.attendanceGeofencing': { $exists: true } },
      { $unset: { 'mehfilDetails.attendanceGeofencing': '' } }
    );
  },
});
