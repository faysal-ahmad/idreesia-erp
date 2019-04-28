import { ModulePaths } from "/imports/ui/constants";

export default class SubModulePaths {
  // *************************************************************************************
  // Data Setup Routes
  // *************************************************************************************
  static dutiesPath = `${ModulePaths.hr}/duties`;
  static dutiesNewFormPath = `${SubModulePaths.dutiesPath}/new`;
  static dutiesEditFormPath(dutyId = ":dutyId") {
    return `${SubModulePaths.dutiesPath}/${dutyId}`;
  }
  static dutiesAttendancePath(dutyId = ":dutyId") {
    return `${SubModulePaths.dutiesPath}/${dutyId}/attendance`;
  }

  static dutyLocationsPath = `${ModulePaths.hr}/duty-locations`;
  static dutyLocationsNewFormPath = `${SubModulePaths.dutyLocationsPath}/new`;
  static dutyLocationsEditFormPath = `${
    SubModulePaths.dutyLocationsPath
  }/:dutyLocationId`;

  static dutyShiftsPath = `${ModulePaths.hr}/duty-shifts`;
  static dutyShiftsNewFormPath = `${SubModulePaths.dutyShiftsPath}/new`;
  static dutyShiftsEditFormPath = `${SubModulePaths.dutyShiftsPath}/:shiftId`;

  static karkunsPath = `${ModulePaths.hr}/karkuns`;
  static karkunsSearchPath = `${SubModulePaths.karkunsPath}/search`;
  static karkunsNewFormPath = `${SubModulePaths.karkunsPath}/new`;
  static karkunsEditFormPath = `${SubModulePaths.karkunsPath}/:karkunId`;

  static attendanceSheetsPath = `${ModulePaths.hr}/attendance-sheets`;
  static attendanceSheetsUploadFormPath = `${
    SubModulePaths.attendanceSheetsPath
  }/upload`;
  static attendanceSheetsMeetingCardsPath = `${
    SubModulePaths.attendanceSheetsPath
  }/meeting-cards`;
}
