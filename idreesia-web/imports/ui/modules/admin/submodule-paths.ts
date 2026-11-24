import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Users Routes
  // *************************************************************************************
  static usersPath = `${ModulePaths.admin}/users`;
  static usersNewFormPath = `${SubModulePaths.usersPath}/new`;
  static usersEditFormPath = `${SubModulePaths.usersPath}/:userId`;

  // *************************************************************************************
  // Service Accounts Routes (an account is edited with the same form as a user)
  // *************************************************************************************
  static serviceAccountsPath = `${ModulePaths.admin}/service-accounts`;
  static serviceAccountsNewFormPath = `${SubModulePaths.serviceAccountsPath}/new`;
  static serviceAccountsEditFormPath = `${SubModulePaths.serviceAccountsPath}/:userId`;

  // *************************************************************************************
  // User Groups Routes
  // *************************************************************************************
  static userGroupsPath = `${ModulePaths.admin}/user-groups`;
  static userGroupsNewFormPath = `${SubModulePaths.userGroupsPath}/new`;
  static userGroupsEditFormPath = `${SubModulePaths.userGroupsPath}/:groupId`;

  static securityLogsPath = `${ModulePaths.admin}/security-logs`;

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

  // *************************************************************************************
  // Free Form Data Routes
  // *************************************************************************************
  static freeFormDataPath = `${ModulePaths.admin}/free-form-data`;

  // *************************************************************************************
  // Locations Routes
  // *************************************************************************************
  static orgLocationsPath = `${ModulePaths.admin}/locations`;
  static orgLocationsEditFormPath(orgLocationId = ':orgLocationId') {
    return `${SubModulePaths.orgLocationsPath}/${orgLocationId}`;
  }
  // A committee is edited under the location it belongs to.
  static orgLocationCommitteeEditFormPath(
    orgLocationId = ':locationId',
    committeeId = ':committeeId'
  ) {
    return `${SubModulePaths.orgLocationsPath}/${orgLocationId}/committees/${committeeId}`;
  }
  static orgLocationCommitteesTabPath(orgLocationId: string) {
    return `${SubModulePaths.orgLocationsEditFormPath(orgLocationId)}?default-active-tab=committees`;
  }

  // *************************************************************************************
  // Mehfil Templates Routes
  // *************************************************************************************
  static mehfilTemplatesPath = `${ModulePaths.admin}/mehfil-templates`;

  // *************************************************************************************
  // Configuration Routes
  // *************************************************************************************
  static facialRecognitionPath = `${ModulePaths.admin}/facial-recognition`;

  // *************************************************************************************
  // Deleted Data Routes
  // *************************************************************************************
  static deletedPeoplePath = `${ModulePaths.admin}/deleted-people`;
  static deletedPersonEditFormPath(personId = ':personId') {
    return `${SubModulePaths.deletedPeoplePath}/${personId}`;
  }

  static duplicatePeoplePath = `${ModulePaths.admin}/duplicate-people`;
  static duplicatePersonEditFormPath(personId = ':personId') {
    return `${SubModulePaths.duplicatePeoplePath}/${personId}`;
  }
}
