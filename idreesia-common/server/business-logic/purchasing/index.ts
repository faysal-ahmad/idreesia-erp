/**
 * Purchasing module: vendors, a catalog of items, and the procure-to-pay
 * documents (requisitions, orders, receipts, invoices, payments).
 *
 * Callers enforce access - nothing here checks whether a user may see or
 * change a record. Every write takes the acting user and is recorded in the
 * audit log. The module enforces data integrity (valid state transitions,
 * quantity and amount limits), never who may do what. Errors are
 * GraphQLErrors with an `extensions.code` (see PurchasingErrorCode).
 */
export type { PurchasingErrorCode } from './errors';

export { nextDocumentNumber } from './numbering';
export { parseDateInput, requireDateInput } from './internal';

export {
  createVendor,
  updateVendor,
  setVendorActive,
  deleteVendor,
  getVendor,
  getUsableVendor,
  listVendors,
} from './vendors';
export type { VendorValues, ListVendorsOptions } from './vendors';

export {
  createCatalogItem,
  updateCatalogItem,
  setCatalogItemActive,
  deleteCatalogItem,
  getCatalogItem,
  listCatalogItems,
} from './catalog-items';
export type {
  CatalogItemValues,
  ListCatalogItemsOptions,
} from './catalog-items';

export {
  createRequisition,
  updateRequisition,
  submitRequisition,
  approveRequisition,
  rejectRequisition,
  reopenRequisition,
  cancelRequisition,
  closeRequisition,
  deleteRequisition,
  getRequisition,
  listRequisitions,
} from './requisitions';
export type {
  RequisitionValues,
  RequisitionLineInput,
  ListRequisitionsOptions,
  RequisitionOrigin,
} from './requisitions';

export {
  createQuote,
  updateQuote,
  selectQuote,
  rejectQuote,
  deleteQuote,
  getQuote,
  listQuotes,
} from './quotes';
export type { QuoteValues, QuoteLineInput, ListQuotesOptions } from './quotes';

export {
  createOrderFromRequisition,
  createOrderFromQuote,
  updateOrder,
  submitOrder,
  approveOrder,
  rejectOrder,
  markOrderSent,
  closeOrder,
  cancelOrder,
  deleteOrder,
  getOrder,
  getStoreOrder,
  listOrders,
  listStoreOrders,
} from './orders';
export type { OrderValues, OrderLineInput, ListOrdersOptions } from './orders';

export { postReceipt, voidReceipt, getReceipt, listReceipts } from './receipts';
export type {
  ReceiptValues,
  ReceiptLineInput,
  ListReceiptsOptions,
  ReceiptOrigin,
} from './receipts';

export {
  createInvoice,
  updateInvoice,
  setInvoiceDisputed,
  voidInvoice,
  getInvoice,
  listInvoices,
} from './invoices';
export type {
  InvoiceValues,
  InvoiceLineInput,
  ListInvoicesOptions,
} from './invoices';

export { postPayment, voidPayment, getPayment, listPayments } from './payments';
export type { PaymentValues, ListPaymentsOptions } from './payments';

export {
  spendingByVendor,
  spendingByMonth,
  openOrders,
  payablesAging,
  vendorLedger,
  dashboardCounts,
} from './reports';
export type { DateRange } from './reports';

export {
  createAttachmentUpload,
  completeAttachmentUpload,
  abortAttachmentUpload,
  listAttachments,
  getAttachment,
  getAttachmentDownload,
  deleteAttachment,
} from './attachments';
export type {
  AttachmentUploadInput,
  AttachmentUploadTicket,
  AttachmentDownload,
} from './attachments';

export {
  listPermissionAssignments,
  addPermissionUser,
  removePermissionUser,
} from './permissions';
export type {
  PermissionAssignmentGroup,
  PermissionAssignment,
  PermissionHolder,
  PermissionGroupHolder,
} from './permissions';

export {
  listUserGroups,
  createUserGroup,
  updateUserGroup,
  deleteUserGroup,
  addGroupMember,
  removeGroupMember,
  addGroupPermission,
  removeGroupPermission,
} from './user-groups';
export type { PurchasingUserGroup, GroupMember } from './user-groups';

export { searchPurchasingKarkuns, searchPurchasingPermissionHolders } from './karkuns';
export type { KarkunSearchParams } from './karkuns';

export {
  getCatalogItemImageUrl,
  setCatalogItemImage,
  removeCatalogItemImage,
} from './catalog-item-images';

export {
  createPettyCashFund,
  updatePettyCashFund,
  setPettyCashFundActive,
  getPettyCashFund,
  listPettyCashFunds,
} from './petty-cash-funds';
export type { PettyCashFundValues, ListPettyCashFundsOptions } from './petty-cash-funds';

export {
  createPettyCashVoucher,
  updatePettyCashVoucher,
  submitPettyCashVoucher,
  approvePettyCashVoucher,
  rejectPettyCashVoucher,
  voidPettyCashVoucher,
  deletePettyCashVoucher,
  getPettyCashVoucher,
  listPettyCashVouchers,
} from './petty-cash-vouchers';
export type {
  PettyCashVoucherValues,
  PettyCashVoucherLineInput,
  ListPettyCashVouchersOptions,
} from './petty-cash-vouchers';

export {
  requestPettyCashReplenishment,
  approvePettyCashReplenishment,
  rejectPettyCashReplenishment,
  getPettyCashReplenishment,
  listPettyCashReplenishments,
} from './petty-cash-replenishments';
export type {
  PettyCashReplenishmentValues,
  ListPettyCashReplenishmentsOptions,
} from './petty-cash-replenishments';

export {
  createPettyCashExpenseHead,
  updatePettyCashExpenseHead,
  setPettyCashExpenseHeadActive,
  deletePettyCashExpenseHead,
  getPettyCashExpenseHead,
  listPettyCashExpenseHeads,
} from './petty-cash-expense-heads';
export type {
  PettyCashExpenseHeadValues,
  ListPettyCashExpenseHeadsOptions,
} from './petty-cash-expense-heads';
