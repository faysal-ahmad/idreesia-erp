import { ModulePaths } from "/imports/ui/constants";

export default class SubModulePaths {
  // *************************************************************************************
  // Data Import Routes
  // *************************************************************************************
  static dataImportsPath = `${ModulePaths.accounts}/data-imports`;
  static dataImportsNewFormPath = `${SubModulePaths.dataImportsPath}/new`;

  // *************************************************************************************
  // Account Heads Routes
  // *************************************************************************************
  static accountHeadsPath(companyId) {
    return `${ModulePaths.accounts}/${companyId}/account-heads`;
  }
  static accountHeadsEditFormPath(companyId) {
    return `${SubModulePaths.accountHeadsPath(companyId)}/:accountHeadId`;
  }

  // *************************************************************************************
  // Voucher Routes
  // *************************************************************************************
  static vouchersPath(companyId) {
    return `${ModulePaths.accounts}/${companyId}/vouchers`;
  }
}
