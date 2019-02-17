import { ModulePaths } from "/imports/ui/constants";

export default class SubModulePaths {
  static dataImportsPath(companyId) {
    return `${ModulePaths.accounts}/${companyId}/data-imports`;
  }

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
