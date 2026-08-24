import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
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

  // *************************************************************************************
  // Cities & Mehfils Routes
  // *************************************************************************************
  static citiesPath = `${ModulePaths.admin}/cities`;
  static citiesNewFormPath = `${SubModulePaths.citiesPath}/new`;
  static citiesEditFormPath(cityId = ':cityId') {
    return `${SubModulePaths.citiesPath}/${cityId}`;
  }

  // *************************************************************************************
  // Jobs Routes
  // *************************************************************************************
  static jobsPath = `${ModulePaths.admin}/jobs`;
  static jobLogsPath = `${ModulePaths.admin}/job-logs`;
  static jobDefinitionsPath = `${ModulePaths.admin}/job-definitions`;

  // *************************************************************************************
  // People Tags Routes
  // *************************************************************************************
  static peopleTagsPath = `${ModulePaths.admin}/people-tags`;
}
