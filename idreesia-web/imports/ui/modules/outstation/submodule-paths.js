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

  // *************************************************************************************
  // Messages Routes
  // *************************************************************************************
  static messagesPath = `${ModulePaths.outstation}/messages`;
  static messagesNewFormPath = `${SubModulePaths.messagesPath}/new`;
  static messagesEditFormPath(messageId = ':messageId') {
    return `${SubModulePaths.messagesPath}/${messageId}`;
  }

  // ******************************************************************************
  // Attendance Sheets
  // ******************************************************************************
  static attendanceSheetsPath = `${ModulePaths.outstation}/attendance-sheets`;

  // ******************************************************************************
  // Audit Logs
  // ******************************************************************************
  static auditLogsPath = `${ModulePaths.outstation}/audit-logs`;
}
