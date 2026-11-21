import SimpleSchema from 'simpl-schema';

import { DutyAttendanceStatusValues } from 'meteor/idreesia-common/constants/duties-attendance';
import { identifiable, timestamps } from '../common';

const GeoLocationSchema = new SimpleSchema({
  latitude: { type: Number, min: -90, max: 90 },
  longitude: { type: Number, min: -180, max: 180 },
  // Metres.
  accuracy: { type: Number, min: 0, optional: true },
});

const RecordKarkunSchema = new SimpleSchema({
  karkunId: { type: String },
  name: { type: String, optional: true },
  addedForDay: { type: Boolean },
  attendance: {
    type: String,
    optional: true,
    allowedValues: DutyAttendanceStatusValues,
  },
  attendanceUpdatedAt: { type: Date, optional: true },
  attendanceUpdatedBy: { type: String, optional: true },
  // How the attendance was marked (one of several ways).
  attendanceSource: { type: String, optional: true },
  // Where it was marked from.
  attendanceGeo: { type: GeoLocationSchema, optional: true },
});

export default new SimpleSchema({
  locationId: { type: String },
  dutyId: { type: String },
  // YYYY-MM-DD, Asia/Karachi.
  date: { type: String },
  karkuns: { type: Array },
  'karkuns.$': { type: RecordKarkunSchema },
})
  .extend(identifiable)
  .extend(timestamps);
