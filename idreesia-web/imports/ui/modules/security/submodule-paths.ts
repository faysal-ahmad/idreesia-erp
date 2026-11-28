import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Event Routes
  // *************************************************************************************
  static eventsPath = `${ModulePaths.security}/events`;
  static eventsEditFormPath(eventId = ':eventId') {
    return `${SubModulePaths.eventsPath}/${eventId}`;
  }

  static eventsKarkunPrintCardsPath(eventId = ':eventId') {
    return `${SubModulePaths.eventsPath}/${eventId}/karkun-print-cards`;
  }

  static eventsKarkunPrintListPath(eventId = ':eventId') {
    return `${SubModulePaths.eventsPath}/${eventId}/karkun-print-list`;
  }

  static eventDutiesPath = `${ModulePaths.security}/event-duties`;
  static eventDutiesEditFormPath(eventDutyId = ':eventDutyId') {
    return `${SubModulePaths.eventDutiesPath}/${eventDutyId}`;
  }

  static eventLangarDishesPath = `${ModulePaths.security}/event-langar-dishes`;
  static eventLangarDishesEditFormPath(
    eventLangarDishId = ':eventLangarDishId'
  ) {
    return `${SubModulePaths.eventLangarDishesPath}/${eventLangarDishId}`;
  }

  static eventLangarLocationsPath = `${ModulePaths.security}/event-langar-locations`;
  static eventLangarLocationsEditFormPath(
    eventLangarLocationId = ':eventLangarLocationId'
  ) {
    return `${SubModulePaths.eventLangarLocationsPath}/${eventLangarLocationId}`;
  }

  // *************************************************************************************
  // Card Verification Routes
  // *************************************************************************************
  static eventCardVerificationPath = `${ModulePaths.security}/event-card-verification`;
  static visitorCardVerificationPath = `${ModulePaths.security}/visitor-card-verification`;

  // *************************************************************************************
  // Visitor Routes
  // *************************************************************************************
  static visitorStayReportPath = `${ModulePaths.security}/visitor-stay-report`;
  static visitorRegistrationPath = `${ModulePaths.security}/visitor-registration`;
  static visitorRegistrationListPath = `${SubModulePaths.visitorRegistrationPath}/list`;
  static visitorRegistrationNewFormPath = `${SubModulePaths.visitorRegistrationPath}/new`;
  static visitorRegistrationUploadFormPath = `${SubModulePaths.visitorRegistrationPath}/upload`;
  static visitorRegistrationEditFormPath(visitorId = ':visitorId') {
    return `${SubModulePaths.visitorRegistrationPath}/${visitorId}`;
  }

  // *************************************************************************************
  // Permissions Routes
  // *************************************************************************************
  static permissionsPath = `${ModulePaths.security}/permissions`;

  // *************************************************************************************
  // Security Server Routes
  // *************************************************************************************
  static securityServerPath = `${ModulePaths.security}/security-server`;
  static securityServerChannelsPath = `${SubModulePaths.securityServerPath}/channels`;

  static securityServerProfilesPath = `${SubModulePaths.securityServerPath}/profiles`;

  static securityServerAlertsPath = `${SubModulePaths.securityServerPath}/alerts`;

  static securityServerUsagePath = `${SubModulePaths.securityServerPath}/usage`;

  // ******************************************************************************
  // Audit Logs
  // ******************************************************************************
  static auditLogsPath = `${ModulePaths.security}/audit-logs`;
}
