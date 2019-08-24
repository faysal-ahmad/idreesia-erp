import { ModulePaths } from "meteor/idreesia-common/constants";

export default class SubModulePaths {
  // *************************************************************************************
  // Account Heads Routes
  // *************************************************************************************
  static accountHeadsPath(companyId = ":companyId") {
    return `${ModulePaths.accounts}/${companyId}/account-heads`;
  }
  static accountHeadsEditFormPath(
    companyId = ":companyId",
    accountHeadId = ":accountHeadId"
  ) {
    return `${SubModulePaths.accountHeadsPath(companyId)}/${accountHeadId}`;
  }

  // *************************************************************************************
  // Activity Sheet Routes
  // *************************************************************************************
  static activitySheetPath(companyId = ":companyId") {
    return `${ModulePaths.accounts}/${companyId}/activity-sheet`;
  }

  // *************************************************************************************
  // Voucher Routes
  // *************************************************************************************
  static vouchersPath(companyId = ":companyId") {
    return `${ModulePaths.accounts}/${companyId}/vouchers`;
  }
  static vouchersNewFormPath(companyId = ":companyId") {
    return `${SubModulePaths.vouchersPath(companyId)}/new`;
  }
  static vouchersEditFormPath(
    companyId = ":companyId",
    voucherId = ":voucherId"
  ) {
    return `${SubModulePaths.vouchersPath(companyId)}/${voucherId}`;
  }

  // *************************************************************************************
  // Amaanat Logs Routes
  // *************************************************************************************
  static amaanatLogsPath = `${ModulePaths.accounts}/amaanat-logs`;
  static amaanatLogsNewFormPath = `${SubModulePaths.amaanatLogsPath}/new`;
  static amaanatLogsEditFormPath(logId = ":logId") {
    return `${SubModulePaths.amaanatLogsPath}/${logId}`;
  }
}
