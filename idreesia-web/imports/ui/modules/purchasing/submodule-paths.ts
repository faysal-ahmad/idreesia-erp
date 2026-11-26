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
  // Petty Cash Routes
  // *************************************************************************************
  static pettyCashVouchersPath = `${ModulePaths.purchasing}/petty-cash/vouchers`;
  static pettyCashVoucherNewPath = `${SubModulePaths.pettyCashVouchersPath}/new`;
  static pettyCashVoucherViewPath(id = ':voucherId') {
    return `${SubModulePaths.pettyCashVouchersPath}/${id}`;
  }
  static pettyCashVoucherEditPath(id = ':voucherId') {
    return `${SubModulePaths.pettyCashVouchersPath}/${id}/edit`;
  }

  static pettyCashReplenishmentsPath = `${ModulePaths.purchasing}/petty-cash/replenishments`;
  static pettyCashReplenishmentViewPath(id = ':replenishmentId') {
    return `${SubModulePaths.pettyCashReplenishmentsPath}/${id}`;
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

  static pettyCashExpenseHeadsPath = `${ModulePaths.purchasing}/petty-cash/expense-heads`;
  static pettyCashFundsPath = `${ModulePaths.purchasing}/petty-cash/funds`;

  // *************************************************************************************
  // Report Routes
  // *************************************************************************************
  static reportsPath = `${ModulePaths.purchasing}/reports`;
  static reportSpendingByVendorPath = `${SubModulePaths.reportsPath}/spending-by-vendor`;
  static reportSpendingByMonthPath = `${SubModulePaths.reportsPath}/spending-by-month`;
  static reportOpenOrdersPath = `${SubModulePaths.reportsPath}/open-orders`;
  static reportPayablesAgingPath = `${SubModulePaths.reportsPath}/payables-aging`;
  static reportVendorLedgerPath = `${SubModulePaths.reportsPath}/vendor-ledger`;

  // *************************************************************************************
  // Administration Routes
  // *************************************************************************************
  static permissionsPath = `${ModulePaths.purchasing}/permissions`;
  static auditLogsPath = `${ModulePaths.purchasing}/audit-logs`;
}
