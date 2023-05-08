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

  static mehfilsKarkunPrintCardsPath(mehfilId = ':mehfilId') {
    return `${SubModulePaths.mehfilsPath}/${mehfilId}/karkun-print-cards`;
  }

  static mehfilsKarkunPrintListPath(mehfilId = ':mehfilId') {
    return `${SubModulePaths.mehfilsPath}/${mehfilId}/karkun-print-list`;
  }

  static mehfilDutiesPath = `${ModulePaths.security}/mehfil-duties`;
  static mehfilDutiesNewFormPath = `${SubModulePaths.mehfilDutiesPath}/new`;
  static mehfilDutiesEditFormPath(mehfilDutyId = ':mehfilDutyId') {
    return `${SubModulePaths.mehfilDutiesPath}/${mehfilDutyId}`;
  }

  static mehfilLangarDishesPath = `${ModulePaths.security}/mehfil-langar-dishes`;
  static mehfilLangarDishesNewFormPath = `${SubModulePaths.mehfilLangarDishesPath}/new`;
  static mehfilLangarDishesEditFormPath(
    mehfilLangarDishId = ':mehfilLangarDishId'
  ) {
    return `${SubModulePaths.mehfilLangarDishesPath}/${mehfilLangarDishId}`;
  }

  static mehfilLangarLocationsPath = `${ModulePaths.security}/mehfil-langar-locations`;
  static mehfilLangarLocationsNewFormPath = `${SubModulePaths.mehfilLangarLocationsPath}/new`;
  static mehfilLangarLocationsEditFormPath(
    mehfilLangarLocationId = ':mehfilLangarLocationId'
  ) {
    return `${SubModulePaths.mehfilLangarLocationsPath}/${mehfilLangarLocationId}`;
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

  // *************************************************************************************
  // Security Users Routes
  // *************************************************************************************
  static securityUsersPath = `${ModulePaths.security}/security-users`;
  static securityUsersEditFormPath(userId = ':userId') {
    return `${SubModulePaths.securityUsersPath}/${userId}`;
  }

  // ******************************************************************************
  // Audit Logs
  // ******************************************************************************
  static auditLogsPath = `${ModulePaths.security}/audit-logs`;
}
