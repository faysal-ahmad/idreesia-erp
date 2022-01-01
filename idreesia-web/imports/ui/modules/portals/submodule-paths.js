import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Karkun Routes
  // *************************************************************************************
  static karkunsPath(portalId = ':portalId') {
    return `${ModulePaths.portals}/${portalId}/karkuns`;
  }
  static karkunsNewFormPath(portalId = ':portalId') {
    return `${SubModulePaths.karkunsPath(portalId)}/new`;
  }
  static karkunsEditFormPath(portalId = ':portalId', karkunId = ':karkunId') {
    return `${SubModulePaths.karkunsPath(portalId)}/${karkunId}`;
  }

  // ******************************************************************************
  // Attendance Sheets
  // ******************************************************************************
  static attendanceSheetsPath(portalId = ':portalId') {
    return `${ModulePaths.portals}/${portalId}/attendance-sheets`;
  }

  // *************************************************************************************
  // Amaanat Logs Routes
  // *************************************************************************************
  static amaanatLogsPath(portalId = ':portalId') {
    return `${ModulePaths.portals}/${portalId}/amaanat-logs`;
  }
  static amaanatLogsNewFormPath(portalId = ':portalId') {
    return `${SubModulePaths.amaanatLogsPath(portalId)}/new`;
  }
  static amaanatLogsEditFormPath(portalId = ':portalId', logId = ':logId') {
    return `${SubModulePaths.amaanatLogsPath(portalId)}/${logId}`;
  }

  // *************************************************************************************
  // Members Routes
  // *************************************************************************************
  static membersPath(portalId = ':portalId') {
    return `${ModulePaths.portals}/${portalId}/members`;
  }
  static membersNewFormPath(portalId = ':portalId') {
    return `${SubModulePaths.membersPath(portalId)}/new`;
  }
  static membersEditFormPath(portalId = ':portalId', memberId = ':memberId') {
    return `${SubModulePaths.membersPath(portalId)}/${memberId}`;
  }

  // ******************************************************************************
  // Audit Logs
  // ******************************************************************************
  static auditLogsPath(portalId = ':portalId') {
    return `${ModulePaths.portals}/${portalId}/audit-logs`;
  }

  // *************************************************************************************
  // Users Routes
  // *************************************************************************************
  static usersPath(portalId = ':portalId') {
    return `${ModulePaths.portals}/${portalId}/users`;
  }
  static usersNewFormPath(portalId = ':portalId') {
    return `${SubModulePaths.usersPath(portalId)}/new`;
  }
  static usersEditFormPath(portalId = ':portalId', userId = ':userId') {
    return `${SubModulePaths.usersPath(portalId)}/${userId}`;
  }
}
