import { ModulePaths } from "/imports/ui/constants";

export default class SubModulePaths {
  // *************************************************************************************
  // Data Setup Routes
  // *************************************************************************************
  static jobsPath = `${ModulePaths.hr}/jobs`;
  static jobsNewFormPath = `${SubModulePaths.jobsPath}/new`;
  static jobsEditFormPath(jobId = ":jobId") {
    return `${SubModulePaths.jobsPath}/${jobId}`;
  }

  static dutiesPath = `${ModulePaths.hr}/duties`;
  static dutiesNewFormPath = `${SubModulePaths.dutiesPath}/new`;
  static dutiesEditFormPath(dutyId = ":dutyId") {
    return `${SubModulePaths.dutiesPath}/${dutyId}`;
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
  static karkunsNewFormPath = `${SubModulePaths.karkunsPath}/new`;
  static karkunsEditFormPath = `${SubModulePaths.karkunsPath}/:karkunId`;

  static attendanceSheetsPath = `${ModulePaths.hr}/attendance-sheets`;
  static attendanceSheetsNewFormPath = `${
    SubModulePaths.attendanceSheetsPath
  }/new`;
  static attendanceSheetsEditFormPath(attendanceId = ":attendanceId") {
    return `${SubModulePaths.attendanceSheetsPath}/${attendanceId}`;
  }
  static attendanceSheetsUploadFormPath = `${
    SubModulePaths.attendanceSheetsPath
  }/upload`;
  static attendanceSheetsMeetingCardsPath = `${
    SubModulePaths.attendanceSheetsPath
  }/meeting-cards`;
}
