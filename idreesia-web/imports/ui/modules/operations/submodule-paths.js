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
  // Wazaif Routes
  // *************************************************************************************
  static wazaifInventoryPath = `${ModulePaths.operations}/wazaif-inventory`;
  static wazaifInventoryNewFormPath = `${SubModulePaths.wazaifInventoryPath}/new`;
  static wazaifInventoryEditFormPath(wazeefaId = ':wazeefaId') {
    return `${SubModulePaths.wazaifInventoryPath}/${wazeefaId}`;
  }

  static wazaifStockAdjustmentPath = `${ModulePaths.operations}/wazaif-stock-adjustments`;

  static wazaifDeliveryOrdersPath = `${ModulePaths.operations}/wazaif-delivery-orders`;
  static wazaifDeliveryOrdersNewFormPath = `${SubModulePaths.wazaifDeliveryOrdersPath}/new`;
  static wazaifDeliveryOrdersEditFormPath(orderId = ':orderId') {
    return `${SubModulePaths.wazaifDeliveryOrdersPath}/${orderId}`;
  }

  static wazaifPrintingOrdersPath = `${ModulePaths.operations}/wazaif-printing-orders`;
  static wazaifPrintingOrdersNewFormPath = `${SubModulePaths.wazaifPrintingOrdersPath}/new`;
  static wazaifPrintingOrdersEditFormPath(orderId = ':orderId') {
    return `${SubModulePaths.wazaifPrintingOrdersPath}/${orderId}`;
  }

  static wazaifVendorsPath = `${ModulePaths.operations}/vendors`;
  static wazaifVendorsNewFormPath = `${SubModulePaths.wazaifVendorsPath}/new`;
  static wazaifVendorsEditFormPath(vendorId = ':vendorId') {
    return `${SubModulePaths.wazaifVendorsPath}/${vendorId}`;
  }
  static wazaifUsersPath = `${ModulePaths.operations}/wazaif-users`;
  static wazaifUsersEditFormPath(userId = ':userId') {
    return `${SubModulePaths.wazaifUsersPath}/${userId}`;
  }

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
