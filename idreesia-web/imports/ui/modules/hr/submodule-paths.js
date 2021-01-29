import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Data Setup Routes
  // *************************************************************************************
  static jobsPath = `${ModulePaths.hr}/jobs`;
  static jobsNewFormPath = `${SubModulePaths.jobsPath}/new`;
  static jobsEditFormPath(jobId = ':jobId') {
    return `${SubModulePaths.jobsPath}/${jobId}`;
  }

  static msDutiesPath = `${ModulePaths.hr}/ms-duties`;
  static msDutiesNewFormPath = `${SubModulePaths.msDutiesPath}/new`;
  static msDutiesEditFormPath(dutyId = ':dutyId') {
    return `${SubModulePaths.msDutiesPath}/${dutyId}`;
  }

  static dutyLocationsPath = `${ModulePaths.hr}/duty-locations`;
  static dutyLocationsNewFormPath = `${SubModulePaths.dutyLocationsPath}/new`;
  static dutyLocationsEditFormPath = `${SubModulePaths.dutyLocationsPath}/:dutyLocationId`;

  // ******************************************************************************
  // Karkuns
  // ******************************************************************************
  static karkunsPath = `${ModulePaths.hr}/karkuns`;
  static karkunsNewFormPath = `${SubModulePaths.karkunsPath}/new`;
  static karkunsScanCardPath = `${SubModulePaths.karkunsPath}/scan-card`;
  static karkunsPrintPath = (karkunId = ':karkunId') =>
    `${SubModulePaths.karkunsPath}/print/${karkunId}`;
  static karkunsPrintListPath = `${SubModulePaths.karkunsPath}/print-list`;
  static karkunsEditFormPath = (karkunId = ':karkunId') =>
    `${SubModulePaths.karkunsPath}/${karkunId}`;

  // ******************************************************************************
  // Attendance Sheets
  // ******************************************************************************
  static attendanceSheetsPath = `${ModulePaths.hr}/attendance-sheets`;
  static attendanceSheetsUploadFormPath = `${SubModulePaths.attendanceSheetsPath}/upload`;
  static attendanceSheetsMeetingCardsPath = `${SubModulePaths.attendanceSheetsPath}/meeting-cards`;
  static attendanceSheetsKarkunCardsPath = `${SubModulePaths.attendanceSheetsPath}/karkun-cards`;
  static attendanceSheetsPrintAttendanceSheetPath = `${SubModulePaths.attendanceSheetsPath}/print-attendance-sheet`;

  // ******************************************************************************
  // Salary Sheets
  // ******************************************************************************
  static salarySheetsPath = `${ModulePaths.hr}/salary-sheets`;
  static salarySheetsSalaryReceiptsPath = `${SubModulePaths.salarySheetsPath}/salary-receipts`;
  static salarySheetsRashanReceiptsPath = `${SubModulePaths.salarySheetsPath}/rashan-receipts`;
  static salarySheetsEidReceiptsPath = `${SubModulePaths.salarySheetsPath}/eid-receipts`;

  // *************************************************************************************
  // Messages Routes
  // *************************************************************************************
  static messagesPath = `${ModulePaths.hr}/messages`;
  static messagesNewFormPath = `${SubModulePaths.messagesPath}/new`;
  static messagesEditFormPath(messageId = ':messageId') {
    return `${SubModulePaths.messagesPath}/${messageId}`;
  }

  // ******************************************************************************
  // Audit Logs
  // ******************************************************************************
  static auditLogsPath = `${ModulePaths.hr}/audit-logs`;
}
