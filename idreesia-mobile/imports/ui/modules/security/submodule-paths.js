import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Mehfil Card Verification Route
  // *************************************************************************************
  static mehfilCardVerificationPath = `${ModulePaths.security}/mehfil-card-verification`;
  static mehfilCardVerificationResultPath = (cardId = ':cardId') =>
    `${ModulePaths.security}/mehfil-card-verification/${cardId}`;

  // *************************************************************************************
  // Visitor Registration Routes
  // *************************************************************************************
  static visitorRegistrationPath = `${ModulePaths.security}/visitor-registration`;
  static visitorRegistrationSearchPath = `${SubModulePaths.visitorRegistrationPath}/search`;
  static visitorRegistrationNewFormPath = `${SubModulePaths.visitorRegistrationPath}/new`;
}
