import { ModulePaths } from 'meteor/idreesia-common/constants';

// URL segment used for committees that have no location.
export const NO_LOCATION_SEGMENT = 'no-location';

export default class SubModulePaths {
  // Base path for a committee workspace, under its location (see
  // NO_LOCATION_SEGMENT for committees without one). Committee sub-modules are nested
  // under this path.
  static committeePath(
    locationId = ':locationId',
    committeeId = ':committeeId'
  ) {
    return `${SubModulePaths.locationPath(locationId)}/committees/${committeeId}`;
  }

  static committeeMembersPath(
    locationId = ':locationId',
    committeeId = ':committeeId'
  ) {
    return `${SubModulePaths.committeePath(locationId, committeeId)}/members`;
  }

  static committeeDiscussionsPath(
    locationId = ':locationId',
    committeeId = ':committeeId'
  ) {
    return `${SubModulePaths.committeePath(locationId, committeeId)}/discussions`;
  }

  static committeeDocumentsPath(
    locationId = ':locationId',
    committeeId = ':committeeId'
  ) {
    return `${SubModulePaths.committeePath(locationId, committeeId)}/documents`;
  }

  static committeeMeetingsPath(
    locationId = ':locationId',
    committeeId = ':committeeId'
  ) {
    return `${SubModulePaths.committeePath(locationId, committeeId)}/meetings`;
  }

  static committeeMeetingPath(
    locationId = ':locationId',
    committeeId = ':committeeId',
    meetingId = ':meetingId'
  ) {
    return `${SubModulePaths.committeeMeetingsPath(locationId, committeeId)}/${meetingId}`;
  }

  static committeePollsPath(
    locationId = ':locationId',
    committeeId = ':committeeId'
  ) {
    return `${SubModulePaths.committeePath(locationId, committeeId)}/polls`;
  }

  static committeePollPath(
    locationId = ':locationId',
    committeeId = ':committeeId',
    pollId = ':pollId'
  ) {
    return `${SubModulePaths.committeePollsPath(locationId, committeeId)}/${pollId}`;
  }

  static committeeProjectsPath(
    locationId = ':locationId',
    committeeId = ':committeeId'
  ) {
    return `${SubModulePaths.committeePath(locationId, committeeId)}/projects`;
  }

  static committeeProjectPath(
    locationId = ':locationId',
    committeeId = ':committeeId',
    projectId = ':projectId'
  ) {
    return `${SubModulePaths.committeeProjectsPath(locationId, committeeId)}/${projectId}`;
  }

  static committeeNightStayReportPath(
    locationId = ':locationId',
    committeeId = ':committeeId'
  ) {
    return `${SubModulePaths.committeePath(locationId, committeeId)}/night-stay-report`;
  }

  static committeeMonitoringAlertsPath(
    locationId = ':locationId',
    committeeId = ':committeeId'
  ) {
    return `${SubModulePaths.committeePath(locationId, committeeId)}/monitoring-alerts`;
  }

  static committeeMonitoringProfilesPath(
    locationId = ':locationId',
    committeeId = ':committeeId'
  ) {
    return `${SubModulePaths.committeePath(locationId, committeeId)}/monitoring-profiles`;
  }

  // Base path for a location's workspaces. Location-owned sub-modules (a
  // mehfil's Duties and Attendance) are nested under this path.
  static locationPath(locationId = ':locationId') {
    return `${ModulePaths.workspaces}/locations/${locationId}`;
  }

  static locationDutiesAttendancePath(locationId = ':locationId') {
    return `${SubModulePaths.locationPath(locationId)}/duties-attendance`;
  }

  static locationDutiesPath(locationId = ':locationId') {
    return `${SubModulePaths.locationDutiesAttendancePath(locationId)}/duties`;
  }

  static locationDutyPlanningPath(locationId = ':locationId') {
    return `${SubModulePaths.locationDutiesAttendancePath(locationId)}/planning`;
  }

  static locationDutyAttendancePath(locationId = ':locationId') {
    return `${SubModulePaths.locationDutiesAttendancePath(locationId)}/attendance`;
  }

  static locationAttendanceSheetPath(locationId = ':locationId') {
    return `${SubModulePaths.locationDutiesAttendancePath(locationId)}/attendance-sheet`;
  }
}
