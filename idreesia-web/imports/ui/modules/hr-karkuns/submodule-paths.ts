import { ModulePaths } from 'meteor/idreesia-common/constants';

const base = ModulePaths.hrKarkuns;

export default class SubModulePaths {
  // ******************************************************************************
  // Karkuns
  // ******************************************************************************
  static karkunsPath = `${base}/karkuns`;
  static karkunsNewFormPath = `${SubModulePaths.karkunsPath}/new`;
  static karkunsPrintPath = (karkunId = ':karkunId') =>
    `${SubModulePaths.karkunsPath}/print/${karkunId}`;
  static karkunsPrintListPath = `${SubModulePaths.karkunsPath}/print-list`;
  static karkunsEditFormPath = (karkunId = ':karkunId') =>
    `${SubModulePaths.karkunsPath}/${karkunId}`;

  // ******************************************************************************
  // Duty Planning
  // ******************************************************************************
  static dutyPlanningPath = `${base}/duty-planning`;
  static dutyAttendancePath = `${base}/duty-attendance`;

  // ******************************************************************************
  // Attendance Report
  // ******************************************************************************
  static attendanceReportPath = `${base}/attendance-report`;
  static attendanceReportMeetingCardsPath = `${SubModulePaths.attendanceReportPath}/meeting-cards`;
  static attendanceReportKarkunCardsPath = `${SubModulePaths.attendanceReportPath}/karkun-cards`;
  static attendanceReportPrintSheetPath = `${SubModulePaths.attendanceReportPath}/print-attendance-sheet`;

  // ******************************************************************************
  // Setup
  // ******************************************************************************
  static msDutiesPath = `${base}/ms-duties`;
  static teamsPath = `${base}/teams`;

  // ******************************************************************************
  // Administration
  // ******************************************************************************
  static auditLogsPath = `${base}/audit-logs`;
  static permissionsPath = `${base}/permissions`;
}
