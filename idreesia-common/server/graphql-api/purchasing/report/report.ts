import gql from 'graphql-tag';

export default gql`
type PurchasingDashboard {
  requisitionsAwaitingApproval: Int
  ordersAwaitingApproval: Int
  openOrders: Int
  overdueInvoices: Int
  totalPayable: Float
  overdueAmount: Float
}

type PurchasingVendorSpending {
  vendorId: String
  vendor: PurchasingVendor
  invoiceCount: Int
  total: Float
  paidAmount: Float
}

type PurchasingMonthlySpending {
  month: String
  invoiceCount: Int
  total: Float
}

type PurchasingOpenOrder {
  orderId: String
  number: String
  vendorId: String
  vendor: PurchasingVendor
  status: String
  orderDate: String
  expectedDeliveryDate: String
  total: Float
  outstandingValue: Float
  isOverdue: Boolean
}

type PurchasingPayablesAgingRow {
  vendorId: String
  vendor: PurchasingVendor
  current: Float
  days1To30: Float
  days31To60: Float
  days61Plus: Float
  total: Float
}

type PurchasingLedgerEntry {
  date: String
  # invoice or payment
  type: String
  documentId: String
  number: String
  reference: String
  # Positive for an invoice, negative for a payment.
  amount: Float
  balance: Float
}

type PurchasingVendorLedger {
  openingBalance: Float
  closingBalance: Float
  entries: [PurchasingLedgerEntry]
}

extend type Query {
  purchasingDashboard: PurchasingDashboard
    @checkPermissions(permissions: [PURCHASING_VIEW_REPORTS, PURCHASING_APPROVE_REQUISITIONS, PURCHASING_APPROVE_ORDERS, PURCHASING_VIEW_ORDERS, PURCHASING_VIEW_INVOICES, PURCHASING_VIEW_PAYMENTS])

  purchasingSpendingByVendor(fromDate: String, toDate: String): [PurchasingVendorSpending]
    @checkPermissions(permissions: [PURCHASING_VIEW_REPORTS])

  purchasingSpendingByMonth(fromDate: String, toDate: String): [PurchasingMonthlySpending]
    @checkPermissions(permissions: [PURCHASING_VIEW_REPORTS])

  purchasingOpenOrders: [PurchasingOpenOrder]
    @checkPermissions(permissions: [PURCHASING_VIEW_REPORTS])

  purchasingPayablesAging: [PurchasingPayablesAgingRow]
    @checkPermissions(permissions: [PURCHASING_VIEW_REPORTS])

  purchasingVendorLedger(vendorId: String!, fromDate: String, toDate: String): PurchasingVendorLedger
    @checkPermissions(permissions: [PURCHASING_VIEW_REPORTS])
}
`;
