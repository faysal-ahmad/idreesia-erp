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
  // Karkun Routes
  // *************************************************************************************
  static karkunsPath = `${ModulePaths.outstation}/karkuns`;
  static karkunsNewFormPath = `${SubModulePaths.karkunsPath}/new`;
  static karkunsEditFormPath(karkunId = ':karkunId') {
    return `${SubModulePaths.karkunsPath}/${karkunId}`;
  }

  // *************************************************************************************
  // Amaanat Logs Routes
  // *************************************************************************************
  static amaanatLogsPath = `${ModulePaths.outstation}/amaanat-logs`;
  static amaanatLogsNewFormPath = `${SubModulePaths.amaanatLogsPath}/new`;
  static amaanatLogsEditFormPath(logId = ':logId') {
    return `${SubModulePaths.amaanatLogsPath}/${logId}`;
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
}
