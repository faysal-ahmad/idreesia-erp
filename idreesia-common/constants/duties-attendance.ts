/**
 * Constants for the headless Duties and Attendance module
 * (server/business-logic/duties-attendance).
 */

/** The module's name as a headless module (notifications are keyed by it). */
export const DUTIES_ATTENDANCE_MODULE = 'duties-attendance';

/**
 * What a user of a workspace may do. They are stored on the user's entry in
 * the workspace (see DutiesAttendanceWorkspaceUsers). Every permission other
 * than VIEW implies VIEW.
 */
export const DutiesAttendancePermissions = {
  /** See the duties, the plan, the attendance and the attendance sheet. */
  VIEW: 'view',
  /** Create, change and delete duties and their members; plan days. */
  MANAGE_AND_PLAN_DUTIES: 'manage-and-plan-duties',
  /** Mark present, late or absent. */
  MARK_ATTENDANCE: 'mark-attendance',
} as const;
export type DutiesAttendancePermission =
  (typeof DutiesAttendancePermissions)[keyof typeof DutiesAttendancePermissions];

export const DutiesAttendancePermissionValues: DutiesAttendancePermission[] =
  Object.values(DutiesAttendancePermissions);

export const DutiesAttendancePermissionInfos: Array<{
  key: DutiesAttendancePermission;
  name: string;
  description: string;
}> = [
  {
    key: DutiesAttendancePermissions.VIEW,
    name: 'View',
    description: 'See duties, the plan, attendance and the attendance sheet.',
  },
  {
    key: DutiesAttendancePermissions.MANAGE_AND_PLAN_DUTIES,
    name: 'Manage and plan duties',
    description:
      'Create, change and delete duties, manage their members and plan days.',
  },
  {
    key: DutiesAttendancePermissions.MARK_ATTENDANCE,
    name: 'Mark attendance',
    description: 'Mark members present, late or absent.',
  },
];

export const DutyAttendanceStatuses = {
  PRESENT: 'present',
  LATE: 'late',
  ABSENT: 'absent',
} as const;
export type DutyAttendanceStatus =
  (typeof DutyAttendanceStatuses)[keyof typeof DutyAttendanceStatuses];

export const DutyAttendanceStatusValues: DutyAttendanceStatus[] =
  Object.values(DutyAttendanceStatuses);

export const DUTIES_ATTENDANCE_DEFAULT_PAGE_SIZE = 50;
export const DUTIES_ATTENDANCE_MAX_PAGE_SIZE = 200;
export const DUTIES_ATTENDANCE_MAX_NAME_LENGTH = 255;
export const DUTIES_ATTENDANCE_MAX_DESCRIPTION_LENGTH = 2000;
/** Days shown by the plan view. */
export const DUTIES_ATTENDANCE_PLAN_DAY_COUNT = 7;
