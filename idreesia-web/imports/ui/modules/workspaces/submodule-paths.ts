import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // Base path for a committee workspace. Committee sub-modules are nested
  // under this path.
  static committeePath(committeeId = ':committeeId') {
    return `${ModulePaths.workspaces}/committees/${committeeId}`;
  }

  static committeeMembersPath(committeeId = ':committeeId') {
    return `${SubModulePaths.committeePath(committeeId)}/members`;
  }

  static committeeDiscussionsPath(committeeId = ':committeeId') {
    return `${SubModulePaths.committeePath(committeeId)}/discussions`;
  }

  static committeeNightStayReportPath(committeeId = ':committeeId') {
    return `${SubModulePaths.committeePath(committeeId)}/night-stay-report`;
  }

  static committeeMonitoringAlertsPath(committeeId = ':committeeId') {
    return `${SubModulePaths.committeePath(committeeId)}/monitoring-alerts`;
  }

  static committeeMonitoringProfilesPath(committeeId = ':committeeId') {
    return `${SubModulePaths.committeePath(committeeId)}/monitoring-profiles`;
  }
}
