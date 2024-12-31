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
  // Org Locations Routes
  // *************************************************************************************
  static orgLocationsPath = `${ModulePaths.admin}/org-locations`;

  // *************************************************************************************
  // Users Routes
  // *************************************************************************************
  static usersPath = `${ModulePaths.admin}/users`;
  static usersNewFormPath = `${SubModulePaths.usersPath}/new`;
  static usersEditFormPath = `${SubModulePaths.usersPath}/:userId`;

  // *************************************************************************************
  // User Groups Routes
  // *************************************************************************************
  static userGroupsPath = `${ModulePaths.admin}/user-groups`;
  static userGroupsNewFormPath = `${SubModulePaths.userGroupsPath}/new`;
  static userGroupsEditFormPath = `${SubModulePaths.userGroupsPath}/:groupId`;

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
