import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Visitor Registration Routes
  // *************************************************************************************
  static visitorRegistrationPath = `${ModulePaths.security}/visitor-registration`;
  static visitorRegistrationListPath = `${SubModulePaths.visitorRegistrationPath}/list`;
  static visitorRegistrationNewFormPath = `${SubModulePaths.visitorRegistrationPath}/new`;
}
