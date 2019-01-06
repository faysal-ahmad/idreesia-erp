import { ModulePaths } from '/imports/ui/constants';

export default class SubModulePaths {
  static transactionsPath(accountId) {
    return `${ModulePaths.accounts}/${accountId}/transactions`;
  }
  static transactionsNewFormPath(accountId) {
    return `${SubModulePaths.transactionsPath(accountId)}/new`;
  }
  static transactionsEditFormPath(accountId) {
    return `${SubModulePaths.transactionsPath(accountId)}/:transactionId`;
  }
}
