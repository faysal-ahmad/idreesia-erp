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

  static committeeDocumentsPath(committeeId = ':committeeId') {
    return `${SubModulePaths.committeePath(committeeId)}/documents`;
  }

  static committeeMeetingsPath(committeeId = ':committeeId') {
    return `${SubModulePaths.committeePath(committeeId)}/meetings`;
  }

  static committeeMeetingPath(
    committeeId = ':committeeId',
    meetingId = ':meetingId'
  ) {
    return `${SubModulePaths.committeeMeetingsPath(committeeId)}/${meetingId}`;
  }

  static committeePollsPath(committeeId = ':committeeId') {
    return `${SubModulePaths.committeePath(committeeId)}/polls`;
  }

  static committeePollPath(committeeId = ':committeeId', pollId = ':pollId') {
    return `${SubModulePaths.committeePollsPath(committeeId)}/${pollId}`;
  }

  static committeeProjectsPath(committeeId = ':committeeId') {
    return `${SubModulePaths.committeePath(committeeId)}/projects`;
  }

  static committeeProjectPath(
    committeeId = ':committeeId',
    projectId = ':projectId'
  ) {
    return `${SubModulePaths.committeeProjectsPath(committeeId)}/${projectId}`;
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
