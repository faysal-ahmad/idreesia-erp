import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Data Setup Routes
  // *************************************************************************************
  static citiesPath = `${ModulePaths.outstation}/cities`;
  static citiesNewFormPath = `${SubModulePaths.citiesPath}/new`;
  static citiesEditFormPath(cityId = ':cityId') {
    return `${SubModulePaths.citiesPath}/${cityId}`;
  }

  static mehfilDutiesPath = `${ModulePaths.outstation}/mehfil-duties`;
  static mehfilDutiesNewFormPath = `${SubModulePaths.mehfilDutiesPath}/new`;
  static mehfilDutiesEditFormPath(dutyId = ':dutyId') {
    return `${SubModulePaths.mehfilDutiesPath}/${dutyId}`;
  }

  static portalsPath = `${ModulePaths.outstation}/portals`;
  static portalsNewFormPath = `${SubModulePaths.portalsPath}/new`;
  static portalsEditFormPath = `${SubModulePaths.portalsPath}/:portalId`;

  // *************************************************************************************
  // Members Routes
  // *************************************************************************************
  static membersPath = `${ModulePaths.outstation}/members`;
  static membersNewFormPath = `${SubModulePaths.membersPath}/new`;
  static membersUploadFormPath = `${SubModulePaths.membersPath}/upload`;
  static membersEditFormPath(memberId = ':memberId') {
    return `${SubModulePaths.membersPath}/${memberId}`;
  }

  // *************************************************************************************
  // Karkun Routes
  // *************************************************************************************
  static karkunsPath = `${ModulePaths.outstation}/karkuns`;
  static karkunsUploadFormPath = `${SubModulePaths.karkunsPath}/upload`;
  static karkunsEditFormPath(karkunId = ':karkunId') {
    return `${SubModulePaths.karkunsPath}/${karkunId}`;
  }

  // ******************************************************************************
  // Attendance Sheets
  // ******************************************************************************
  static attendanceSheetsPath = `${ModulePaths.outstation}/attendance-sheets`;

  // *************************************************************************************
  // Portal Users Routes
  // *************************************************************************************
  static portalUsersPath = `${ModulePaths.outstation}/portal-users`;
  static portalUsersNewFormPath = `${SubModulePaths.portalUsersPath}/new`;
  static portalUsersEditFormPath(userId = ':userId') {
    return `${SubModulePaths.portalUsersPath}/${userId}`;
  }

  // *************************************************************************************
  // Outstation Users Routes
  // *************************************************************************************
  static outstationUsersPath = `${ModulePaths.outstation}/outstation-users`;

  // ******************************************************************************
  // Audit and Security Logs
  // ******************************************************************************
  static auditLogsPath = `${ModulePaths.outstation}/audit-logs`;
  static securityLogsPath = `${ModulePaths.outstation}/security-logs`;
}
