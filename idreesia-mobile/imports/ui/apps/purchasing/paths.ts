import { ModulePaths } from 'meteor/idreesia-common/constants';

const base = ModulePaths.purchasing;

const approvals = `${base}/approvals`;
const receiving = `${base}/receiving`;
const requisitions = `${base}/requisitions`;
const orders = `${base}/orders`;
const receipts = `${base}/receipts`;
const invoices = `${base}/invoices`;
const payments = `${base}/payments`;
const vendors = `${base}/vendors`;
const catalog = `${base}/catalog`;

/** Query-string values the Home tab uses to open a list already filtered. */
export const PurchasingQueries = {
  approvalsRequisitions: 'requisitions',
  approvalsOrders: 'orders',
} as const;

export const PurchasingPaths = {
  dashboard: `${base}/dashboard`,

  approvals,
  approvalsTab: (tab: string) => `${approvals}?tab=${tab}`,
  approvalRequisitionPattern: `${approvals}/requisitions/:id`,
  approvalRequisition: (id: string) => `${approvals}/requisitions/${id}`,
  approvalOrderPattern: `${approvals}/orders/:id`,
  approvalOrder: (id: string) => `${approvals}/orders/${id}`,

  receiving,
  receivePattern: `${receiving}/:orderId`,
  receive: (orderId: string) => `${receiving}/${orderId}`,

  requisitions,
  requisitionsWithStatus: (status: string) => `${requisitions}?status=${status}`,
  requisitionNew: `${requisitions}/new`,
  requisitionPattern: `${requisitions}/:id`,
  requisition: (id: string) => `${requisitions}/${id}`,
  requisitionEditPattern: `${requisitions}/:id/edit`,
  requisitionEdit: (id: string) => `${requisitions}/${id}/edit`,

  orders,
  orderPattern: `${orders}/:id`,
  order: (id: string) => `${orders}/${id}`,

  receipts,
  receiptPattern: `${receipts}/:id`,
  receipt: (id: string) => `${receipts}/${id}`,

  invoices,
  invoicesOverdue: `${invoices}?overdue=1`,
  invoicePattern: `${invoices}/:id`,
  invoice: (id: string) => `${invoices}/${id}`,

  payments,
  paymentPattern: `${payments}/:id`,
  payment: (id: string) => `${payments}/${id}`,

  vendors,
  vendorPattern: `${vendors}/:id`,
  vendor: (id: string) => `${vendors}/${id}`,

  catalog,
  catalogItemPattern: `${catalog}/:id`,
  catalogItem: (id: string) => `${catalog}/${id}`,
};
