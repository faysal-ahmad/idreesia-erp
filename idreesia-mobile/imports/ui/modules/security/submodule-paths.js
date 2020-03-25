import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Karkun Verification Route
  // *************************************************************************************
  static karkunCardVerificationPath = `${ModulePaths.security}/karkun-card-verification`;
  static karkunCardVerificationResultPath = (cardId = ':cardId') =>
    `${ModulePaths.security}/karkun-card-verification/${cardId}`;

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
