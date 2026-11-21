import type {
  DutiesAttendancePermission,
  DutyAttendanceStatus,
} from 'meteor/idreesia-common/constants/duties-attendance';

/** Free-form key/value data callers attach to workspaces. */
export type DutiesAttendanceMetadata = Record<string, unknown>;

interface Timestamps {
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

export interface DutiesAttendanceWorkspaceDocument extends Timestamps {
  _id: string;
  name: string;
  description?: string;
  metadata?: DutiesAttendanceMetadata;
}

export interface DutiesAttendanceWorkspaceUserDocument extends Timestamps {
  _id: string;
  workspaceId: string;
  userId: string;
  permissions: DutiesAttendancePermission[];
}

export interface DutyMember {
  karkunId: string;
  isCoordinator?: boolean;
  /** Empty or missing: every day. */
  daysOfWeek?: string[];
}

export interface DutiesAttendanceDutyDocument extends Timestamps {
  _id: string;
  workspaceId: string;
  name: string;
  description?: string;
  /** First day the duty is planned (YYYY-MM-DD). */
  startDate?: string;
  /** Missing means active. */
  isActive?: boolean;
  members: DutyMember[];
}

export interface DutiesAttendanceDayOverrideDocument extends Timestamps {
  _id: string;
  workspaceId: string;
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
  workspaceId: string;
  dutyId: string;
  date: string;
  karkuns: DayRecordKarkun[];
}
