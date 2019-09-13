import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Karkun Card Verification Routes
  // *************************************************************************************
  static karkunCardVerificationPath = `${ModulePaths.security}/karkun-card-verification`;

  // *************************************************************************************
  // Visitor Registration Routes
  // *************************************************************************************
  static visitorRegistrationPath = `${ModulePaths.security}/visitor-registration`;
  static visitorRegistrationListPath = `${SubModulePaths.visitorRegistrationPath}/list`;
  static visitorRegistrationNewFormPath = `${SubModulePaths.visitorRegistrationPath}/new`;
  static visitorRegistrationEditFormPath(visitorId = ':visitorId') {
    return `${SubModulePaths.visitorRegistrationPath}/${visitorId}`;
  }

  // *************************************************************************************
  // Visitor Card Verification Routes
  // *************************************************************************************
  static visitorCardVerificationPath = `${ModulePaths.security}/visitor-card-verification`;

  // *************************************************************************************
  // Visitor's Stay Report Routes
  // *************************************************************************************
  static visitorStayReportPath = `${ModulePaths.security}/visitor-stay-report`;
}
