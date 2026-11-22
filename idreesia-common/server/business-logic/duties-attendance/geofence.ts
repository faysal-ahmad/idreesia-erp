import type { AttendanceGeoLocation } from 'meteor/idreesia-common/server/collections/duties-attendance';
import type { OrgLocationDocument } from 'meteor/idreesia-common/server/collections/admin';

import { dutiesAttendanceError } from './errors';

const EARTH_RADIUS_METRES = 6371000;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** The great-circle distance between two points, in metres (haversine). */
export function distanceInMetres(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_METRES * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Throws when the mehfil has an attendance geofence and `geo` is outside it.
 * Does nothing when there is no geofence.
 */
export function assertWithinGeofence(
  location: OrgLocationDocument,
  geo: AttendanceGeoLocation | undefined
) {
  const details = location.mehfilDetails;
  const radius = details?.attendanceGeofenceMeters;
  if (!radius) return;
  if (!geo) {
    throw dutiesAttendanceError(
      'BAD_USER_INPUT',
      'Your location is required to mark attendance at this mehfil.'
    );
  }
  if (details?.latitude == null || details.longitude == null) return;
  const distance = distanceInMetres(geo, {
    latitude: details.latitude,
    longitude: details.longitude,
  });
  if (distance > radius) {
    throw dutiesAttendanceError(
      'BAD_USER_INPUT',
      `You must be within ${radius} meters of the mehfil to mark attendance.`
    );
  }
}
