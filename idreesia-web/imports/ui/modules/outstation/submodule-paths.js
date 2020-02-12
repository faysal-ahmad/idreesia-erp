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

  // ******************************************************************************
  // Attendance Sheets
  // ******************************************************************************
  static attendanceSheetsPath = `${ModulePaths.outstation}/attendance-sheets`;
}
