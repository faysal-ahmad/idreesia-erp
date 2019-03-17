import { ModulePaths } from "/imports/ui/constants";

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
  static vouchersPath(companyId) {
    return `${ModulePaths.accounts}/${companyId}/vouchers`;
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
