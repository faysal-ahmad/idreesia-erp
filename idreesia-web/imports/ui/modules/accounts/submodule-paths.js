import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Data Setup Routes
  // *************************************************************************************
  static paymentTypesPath = `${ModulePaths.accounts}/payment-types`;
  static paymentTypesNewFormPath = `${SubModulePaths.paymentTypesPath}/new`;
  static paymentTypesEditFormPath(paymentTypeId = ':paymentTypeId') {
    return `${SubModulePaths.paymentTypesPath}/${paymentTypeId}`;
  }

  // ******************************************************************************
  // Audit Logs
  // ******************************************************************************
  static auditLogsPath = `${ModulePaths.accounts}/audit-logs`;

  // *************************************************************************************
  // Account Heads Routes
  // *************************************************************************************
  static accountHeadsPath(companyId = ':companyId') {
    return `${ModulePaths.accounts}/${companyId}/account-heads`;
  }
  static accountHeadsEditFormPath(
    companyId = ':companyId',
    accountHeadId = ':accountHeadId'
  ) {
    return `${SubModulePaths.accountHeadsPath(companyId)}/${accountHeadId}`;
  }

  // *************************************************************************************
  // Activity Sheet Routes
  // *************************************************************************************
  static activitySheetPath(companyId = ':companyId') {
    return `${ModulePaths.accounts}/${companyId}/activity-sheet`;
  }

  // *************************************************************************************
  // Voucher Routes
  // *************************************************************************************
  static vouchersPath(companyId = ':companyId') {
    return `${ModulePaths.accounts}/${companyId}/vouchers`;
  }
  static vouchersNewFormPath(companyId = ':companyId') {
    return `${SubModulePaths.vouchersPath(companyId)}/new`;
  }
  static vouchersEditFormPath(
    companyId = ':companyId',
    voucherId = ':voucherId'
  ) {
    return `${SubModulePaths.vouchersPath(companyId)}/${voucherId}`;
  }

  // *************************************************************************************
  // Payments Routes
  // *************************************************************************************
  static paymentsPath = `${ModulePaths.accounts}/payments`;
  static paymentsNewFormPath = `${SubModulePaths.paymentsPath}/new`;
  static paymentsEditFormPath(paymentId = ':paymentId') {
    return `${SubModulePaths.paymentsPath}/${paymentId}`;
  }
  static paymentReceiptsPath(paymentId = ':paymentId') {
    return `${SubModulePaths.paymentsPath}/${paymentId}/payment-receipts`;
  }
}
