import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Data Setup Routes
  // *************************************************************************************
  static imdadReasonsPath = `${ModulePaths.operations}/imdad-reasons`;
  static imdadReasonsNewFormPath = `${SubModulePaths.imdadReasonsPath}/new`;
  static imdadReasonsEditFormPath(imdadReasonId = ':imdadReasonId') {
    return `${SubModulePaths.imdadReasonsPath}/${imdadReasonId}`;
  }

  // *************************************************************************************
  // Visitor Routes
  // *************************************************************************************
  static visitorsPath = `${ModulePaths.operations}/visitors`;
  static visitorsNewFormPath = `${SubModulePaths.visitorsPath}/new`;
  static visitorsScanFormPath = `${SubModulePaths.visitorsPath}/scan`;
  static visitorsEditFormPath(visitorId = ':visitorId') {
    return `${SubModulePaths.visitorsPath}/${visitorId}`;
  }

  // *************************************************************************************
  // Messages Routes
  // *************************************************************************************
  static messagesPath = `${ModulePaths.operations}/messages`;
  static messagesNewFormPath = `${SubModulePaths.messagesPath}/new`;
  static messagesEditFormPath(messageId = ':messageId') {
    return `${SubModulePaths.messagesPath}/${messageId}`;
  }

  // *************************************************************************************
  // Wazaif Routes
  // *************************************************************************************
  static wazaifInventoryPath = `${ModulePaths.operations}/wazaif-inventory`;
  static wazaifInventoryNewFormPath = `${SubModulePaths.wazaifInventoryPath}/new`;
  static wazaifInventoryEditFormPath(wazeefaId = ':wazeefaId') {
    return `${SubModulePaths.wazaifInventoryPath}/${wazeefaId}`;
  }

  static wazaifStockAdjustmentPath = `${ModulePaths.operations}/wazaif-stock-adjustments`;

  // *************************************************************************************
  // Imdad Requests Routes
  // *************************************************************************************
  static imdadRequestsPath = `${ModulePaths.operations}/imdad-requests`;
  static imdadRequestsNewFormPath = `${SubModulePaths.imdadRequestsPath}/new`;
  static imdadRequestsEditFormPath(requestId = ':requestId') {
    return `${SubModulePaths.imdadRequestsPath}/${requestId}`;
  }

  // *************************************************************************************
  // Report Routes
  // *************************************************************************************
  static imdadRequestReportPath = `${ModulePaths.operations}/imdad-request-report`;
  static newEhadReportPath = `${ModulePaths.operations}/new-ehad-report`;
}
