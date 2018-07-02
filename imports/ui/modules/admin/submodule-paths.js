import { ModulePaths } from '/imports/ui/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Data Setup Routes
  // *************************************************************************************
  static accountsPath = `${ModulePaths.admin}/accounts`;
  static accountsNewFormPath = `${SubModulePaths.accountsPath}/new`;
  static accountsEditFormPath = `${SubModulePaths.accountsPath}/:karkunId`;

  static physicalStoresPath = `${ModulePaths.admin}/physical-stores`;
  static physicalStoresNewFormPath = `${SubModulePaths.physicalStoresPath}/new`;
  static physicalStoresEditFormPath = `${SubModulePaths.physicalStoresPath}/:physicalStoreId`;

  static financialAccountsPath = `${ModulePaths.admin}/financial-accounts`;
  static financialAccountsNewFormPath = `${SubModulePaths.financialAccountsPath}/new`;
  static financialAccountsEditFormPath = `${SubModulePaths.financialAccountsPath}/:accountId`;
}
