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
  // Voucher Routes
  // *************************************************************************************
  static vouchersPath(companyId) {
    return `${ModulePaths.accounts}/${companyId}/vouchers`;
  }
}
