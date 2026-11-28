import { ModulePaths } from 'meteor/idreesia-common/constants';

const base = ModulePaths.hrEmployees;

export default class SubModulePaths {
  // ******************************************************************************
  // Employees
  // ******************************************************************************
  static employeesPath = `${base}/employees`;
  static employeePrintPath = (employeeId = ':employeeId') =>
    `${SubModulePaths.employeesPath}/print/${employeeId}`;
  static employeesPrintListPath = `${SubModulePaths.employeesPath}/print-list`;
  static employeeEditFormPath = (employeeId = ':employeeId') =>
    `${SubModulePaths.employeesPath}/${employeeId}`;

  // ******************************************************************************
  // Leaves
  // ******************************************************************************
  static leavesPath = `${base}/leaves`;
  static leaveRequestPath = (requestId = ':requestId') =>
    `${SubModulePaths.leavesPath}/${requestId}`;

  // ******************************************************************************
  // Salary Sheets
  // ******************************************************************************
  static salarySheetsPath = `${base}/salary-sheets`;
  static salarySheetsSalaryReceiptsPath = `${SubModulePaths.salarySheetsPath}/salary-receipts`;
  static salarySheetsRashanReceiptsPath = `${SubModulePaths.salarySheetsPath}/rashan-receipts`;
  static salarySheetsEidReceiptsPath = `${SubModulePaths.salarySheetsPath}/eid-receipts`;

  // ******************************************************************************
  // Setup
  // ******************************************************************************
  static jobsPath = `${base}/jobs`;
  static jobsEditFormPath(jobId = ':jobId') {
    return `${SubModulePaths.jobsPath}/${jobId}`;
  }
  static leaveTypesPath = `${base}/leave-types`;

  // ******************************************************************************
  // Administration
  // ******************************************************************************
  static auditLogsPath = `${base}/audit-logs`;
  static permissionsPath = `${base}/permissions`;
}
