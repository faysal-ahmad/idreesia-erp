import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Mehfil Routes
  // *************************************************************************************
  static mehfilsPath = `${ModulePaths.security}/mehfils`;
  static mehfilsNewFormPath = `${SubModulePaths.mehfilsPath}/new`;
  static mehfilsEditFormPath(mehfilId = ':mehfilId') {
    return `${SubModulePaths.mehfilsPath}/${mehfilId}`;
  }

  static mehfilsKarkunListPath(mehfilId = ':mehfilId') {
    return `${SubModulePaths.mehfilsPath}/${mehfilId}/karkuns`;
  }

  static mehfilsKarkunCardsPath(mehfilId = ':mehfilId') {
    return `${SubModulePaths.mehfilsPath}/${mehfilId}/karkun-cards`;
  }

  static mehfilDutiesPath = `${ModulePaths.security}/mehfil-duties`;
  static mehfilDutiesNewFormPath = `${SubModulePaths.mehfilDutiesPath}/new`;
  static mehfilDutiesEditFormPath(mehfilDutyId = ':mehfilDutyId') {
    return `${SubModulePaths.mehfilDutiesPath}/${mehfilDutyId}`;
  }

  // *************************************************************************************
  // Card Verification Routes
  // *************************************************************************************
  static mehfilCardVerificationPath = `${ModulePaths.security}/mehfil-card-verification`;
  static karkunCardVerificationPath = `${ModulePaths.security}/karkun-card-verification`;
  static visitorCardVerificationPath = `${ModulePaths.security}/visitor-card-verification`;

  // *************************************************************************************
  // Visitor Registration Routes
  // *************************************************************************************
  static visitorRegistrationPath = `${ModulePaths.security}/visitor-registration`;
  static visitorRegistrationListPath = `${SubModulePaths.visitorRegistrationPath}/list`;
  static visitorRegistrationNewFormPath = `${SubModulePaths.visitorRegistrationPath}/new`;
  static visitorRegistrationUploadFormPath = `${SubModulePaths.visitorRegistrationPath}/upload`;
  static visitorRegistrationEditFormPath(visitorId = ':visitorId') {
    return `${SubModulePaths.visitorRegistrationPath}/${visitorId}`;
  }

  // *************************************************************************************
  // Report Routes
  // *************************************************************************************
  static visitorStayReportPath = `${ModulePaths.security}/visitor-stay-report`;
  static teamVisitReportPath = `${ModulePaths.security}/team-visit-report`;

  // ******************************************************************************
  // Shared Residences
  // ******************************************************************************
  static sharedResidencesPath = `${ModulePaths.security}/shared-residences`;
  static sharedResidencesNewFormPath = `${SubModulePaths.sharedResidencesPath}/new`;
  static sharedResidencesEditFormPath(
    sharedResidenceId = ':sharedResidenceId'
  ) {
    return `${SubModulePaths.sharedResidencesPath}/${sharedResidenceId}`;
  }

  // ******************************************************************************
  // Audit Logs
  // ******************************************************************************
  static auditLogsPath = `${ModulePaths.security}/audit-logs`;
}
