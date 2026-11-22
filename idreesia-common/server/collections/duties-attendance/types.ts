import type { DutyAttendanceStatus } from 'meteor/idreesia-common/constants/duties-attendance';

interface Timestamps {
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

export interface DutyMember {
  karkunId: string;
  isCoordinator?: boolean;
  /** The member may mark their own attendance (from the mobile app). */
  canMarkOwnAttendance?: boolean;
  /** Empty or missing: every day. */
  daysOfWeek?: string[];
}

export interface DutiesAttendanceDutyDocument extends Timestamps {
  _id: string;
  locationId: string;
  /** The mehfil template duty it is a duty of; it supplies name and description. */
  mehfilDutyId: string;
  /** First day the duty is planned (YYYY-MM-DD). */
  startDate?: string;
  /** Missing means active. */
  isActive?: boolean;
  members: DutyMember[];
}

export interface DutiesAttendanceDayOverrideDocument extends Timestamps {
  _id: string;
  locationId: string;
  dutyId: string;
  date: string;
  addedKarkunIds?: string[];
  absentKarkunIds?: string[];
}

export interface AttendanceGeoLocation {
  latitude: number;
  longitude: number;
  /** Metres. */
  accuracy?: number;
}

export interface DayRecordKarkun {
  karkunId: string;
  name?: string;
  addedForDay: boolean;
  attendance?: DutyAttendanceStatus;
  attendanceUpdatedAt?: Date;
  attendanceUpdatedBy?: string;
  /** How the attendance was marked. */
  attendanceSource?: string;
  /** Where the attendance was marked from. */
  attendanceGeo?: AttendanceGeoLocation;
}

export interface DutiesAttendanceDayRecordDocument extends Timestamps {
  _id: string;
  locationId: string;
  dutyId: string;
  date: string;
  karkuns: DayRecordKarkun[];
}
