/**
 * Headless Duties and Attendance module: workspaces of duties, each with a
 * direct roster of karkuns. Future days are planned by changing the roster or
 * with per-day overrides; each day's roster is locked at the start of the day
 * and attendance (present, late, absent) is marked against it. A workspace
 * also keeps its own users, each with a set of permissions.
 *
 * Callers enforce access - nothing here checks whether a user may see or
 * change a workspace or duty. Every function that writes takes the acting
 * user's id, which is recorded on changes. Errors are GraphQLErrors with an
 * `extensions.code` (see DutiesAttendanceErrorCode).
 */
export type { DutiesAttendanceErrorCode } from './errors';

export {
  createDutiesAttendanceWorkspace,
  getDutiesAttendanceWorkspace,
  deleteDutiesAttendanceWorkspace,
  restoreDutiesAttendanceWorkspace,
  purgeDutiesAttendanceWorkspace,
} from './workspaces';
export type { CreateDutiesAttendanceWorkspaceInput } from './workspaces';

export {
  normalizePermissions,
  addDutiesAttendanceWorkspaceUser,
  updateDutiesAttendanceWorkspaceUserPermissions,
  removeDutiesAttendanceWorkspaceUser,
  searchWorkspaceUserCandidates,
} from './users';
export type { WorkspaceUserCandidate } from './users';

export {
  createDuty,
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

export { searchWorkspaceKarkuns } from './karkuns';
export type { WorkspaceKarkunSearchParams } from './karkuns';

export { listMyDutiesAttendanceLocations } from './locations';
export type { MyDutiesAttendanceLocation } from './locations';

export { ensureDutiesAttendanceIndexes } from './internal';

export { DUTIES_ATTENDANCE_MODULE } from 'meteor/idreesia-common/constants/duties-attendance';
export { dutiesAttendanceModule } from './module';
