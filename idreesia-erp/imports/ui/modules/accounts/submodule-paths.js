import { ModulePaths } from "/imports/ui/constants";

export default class SubModulePaths {
  static dataImportsPath = `${ModulePaths.accounts}/data-imports`;
  static dataImportsNewFormPath = `${SubModulePaths.dataImportsPath}/new`;

  static vouchersPath(companyId) {
    return `${ModulePaths.accounts}/${companyId}/vouchers`;
  }
  static vouchersNewFormPath(companyId) {
    return `${SubModulePaths.vouchersPath(companyId)}/new`;
  }
  static vouchersEditFormPath(companyId) {
    return `${SubModulePaths.vouchersPath(companyId)}/:voucherId`;
  }
}
