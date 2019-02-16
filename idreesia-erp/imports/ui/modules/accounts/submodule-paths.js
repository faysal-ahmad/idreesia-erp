import { ModulePaths } from "/imports/ui/constants";

export default class SubModulePaths {
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
