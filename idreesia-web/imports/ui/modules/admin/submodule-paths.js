import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Admin Jobs Routes
  // *************************************************************************************
  static adminJobsPath = `${ModulePaths.admin}/admin-jobs`;
  static adminJobsNewAccountsImportPath = `${SubModulePaths.adminJobsPath}/new-accounts-import`;
  static adminJobsNewVouchersImportPath = `${SubModulePaths.adminJobsPath}/new-vouchers-import`;
  static adminJobsNewAccountsCalculationPath = `${SubModulePaths.adminJobsPath}/new-accounts-calculation`;

  // *************************************************************************************
  // Security Accounts Routes
  // *************************************************************************************
  static accountsPath = `${ModulePaths.admin}/accounts`;
  static accountsNewFormPath = `${SubModulePaths.accountsPath}/new`;
  static accountsEditFormPath = `${SubModulePaths.accountsPath}/:userId`;

  // *************************************************************************************
  // Security Groups Routes
  // *************************************************************************************
  static groupsPath = `${ModulePaths.admin}/groups`;
  static groupsNewFormPath = `${SubModulePaths.groupsPath}/new`;
  static groupsEditFormPath = `${SubModulePaths.groupsPath}/:groupId`;

  // *************************************************************************************
  // Instance Routes
  // *************************************************************************************
  static physicalStoresPath = `${ModulePaths.admin}/physical-stores`;
  static physicalStoresNewFormPath = `${SubModulePaths.physicalStoresPath}/new`;
  static physicalStoresEditFormPath = `${SubModulePaths.physicalStoresPath}/:physicalStoreId`;

  static companiesPath = `${ModulePaths.admin}/companies`;
  static companiesNewFormPath = `${SubModulePaths.companiesPath}/new`;
  static companiesEditFormPath = `${SubModulePaths.companiesPath}/:companyId`;
}
