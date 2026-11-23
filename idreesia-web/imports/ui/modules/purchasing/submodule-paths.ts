import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  static dashboardPath = `${ModulePaths.purchasing}/dashboard`;

  // *************************************************************************************
  // Procure-to-pay Routes
  // *************************************************************************************
  static requisitionsPath = `${ModulePaths.purchasing}/requisitions`;
  static requisitionNewPath = `${SubModulePaths.requisitionsPath}/new`;
  static requisitionEditPath(id = ':requisitionId') {
    return `${SubModulePaths.requisitionsPath}/${id}`;
  }

  static quotesPath = `${ModulePaths.purchasing}/quotes`;
  static quoteNewPath = `${SubModulePaths.quotesPath}/new`;
  static quoteEditPath(id = ':quoteId') {
    return `${SubModulePaths.quotesPath}/${id}`;
  }

  static ordersPath = `${ModulePaths.purchasing}/orders`;
  static orderNewPath = `${SubModulePaths.ordersPath}/new`;
  static orderEditPath(id = ':orderId') {
    return `${SubModulePaths.ordersPath}/${id}`;
  }
  static orderPrintPath(id = ':orderId') {
    return `${SubModulePaths.ordersPath}/${id}/print`;
  }

  static receiptsPath = `${ModulePaths.purchasing}/receipts`;
  static receiptNewPath = `${SubModulePaths.receiptsPath}/new`;
  static receiptViewPath(id = ':receiptId') {
    return `${SubModulePaths.receiptsPath}/${id}`;
  }

  static invoicesPath = `${ModulePaths.purchasing}/invoices`;
  static invoiceNewPath = `${SubModulePaths.invoicesPath}/new`;
  static invoiceViewPath(id = ':invoiceId') {
    return `${SubModulePaths.invoicesPath}/${id}`;
  }

  static paymentsPath = `${ModulePaths.purchasing}/payments`;
  static paymentNewPath = `${SubModulePaths.paymentsPath}/new`;
  static paymentViewPath(id = ':paymentId') {
    return `${SubModulePaths.paymentsPath}/${id}`;
  }

  // *************************************************************************************
  // Setup Routes
  // *************************************************************************************
  static vendorsPath = `${ModulePaths.purchasing}/vendors`;
  static vendorEditPath(vendorId = ':vendorId') {
    return `${SubModulePaths.vendorsPath}/${vendorId}`;
  }

  static catalogPath = `${ModulePaths.purchasing}/catalog`;
  static catalogItemEditPath(itemId = ':itemId') {
    return `${SubModulePaths.catalogPath}/${itemId}`;
  }

  static reportsPath = `${ModulePaths.purchasing}/reports`;
  static permissionsPath = `${ModulePaths.purchasing}/permissions`;
  static auditLogsPath = `${ModulePaths.purchasing}/audit-logs`;
}
