/**
 * Duties and Attendance: a location's duties, each with a direct roster of
 * karkuns. Future days are planned by changing the roster or with per-day
 * overrides; each day's roster is locked at the start of the day and
 * attendance (present, late, absent) is marked against it. Who may use it is
 * kept on the location (OrgLocationUsers).
 *
 * Callers enforce access - nothing here checks whether a user may see or
 * change a location's duties. Every function that writes takes the acting
 * user's id, which is recorded on changes. Errors are GraphQLErrors with an
 * `extensions.code` (see DutiesAttendanceErrorCode).
 */
export type { DutiesAttendanceErrorCode } from './errors';

export {
  createDuty,
  addDuties,
  updateDuty,
  removeDuty,
  addDutyMember,
  updateDutyMember,
  removeDutyMember,
} from './duties';
export type { CreateDutyInput, UpdateDutyInput, DutyMemberInput } from './duties';

export {
  getDutyPlanDays,
  setDutyDayOverride,
  setDutyAttendance,
  createTodayDayRecords,
} from './planning';
export type { PlanDay, PlanKarkun } from './planning';

export { getAttendanceSheet } from './attendance';
export type { AttendanceSheetRow } from './attendance';

export { listMyDuties } from './my-duties';
export type { MyDuty } from './my-duties';

export { searchWorkspaceKarkuns } from './karkuns';
export type { WorkspaceKarkunSearchParams } from './karkuns';

export { listMyDutiesAttendanceLocations } from './locations';
export type { MyDutiesAttendanceLocation } from './locations';

export { ensureDutiesAttendanceIndexes, getDutyNames } from './internal';
