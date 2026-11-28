import gql from 'graphql-tag';

export default gql`
type PurchasingPettyCashVoucherLine {
  _id: String
  description: String
  unit: String
  quantity: Float
  unitPrice: Float
  amount: Float
  physicalStoreId: String
  physicalStoreName: String
  externalCatalogId: String
  stockItemName: String
}

input PurchasingPettyCashVoucherLineInput {
  _id: String
  description: String!
  unit: String
  quantity: Float!
  unitPrice: Float!
  physicalStoreId: String
  externalCatalogId: String
}

type PurchasingPettyCashVoucher {
  _id: String
  number: String
  fundId: String
  fund: PurchasingPettyCashFund
  expenseHeadId: String
  expenseHead: PurchasingPettyCashExpenseHead
  voucherDate: String
  payee: String
  vendorId: String
  vendor: PurchasingVendor
  purpose: String
  lines: [PurchasingPettyCashVoucherLine]
  total: Float
  status: String
  version: Int
  submittedAt: String
  submittedBy: String
  approvedAt: String
  approvedBy: String
  rejectedAt: String
  rejectedBy: String
  rejectionReason: String
  voidedAt: String
  voidedBy: String
  voidReason: String
  replenishmentId: String

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type PagedPurchasingPettyCashVouchers {
  totalResults: Int
  data: [PurchasingPettyCashVoucher]
}

extend type Query {
  purchasingPettyCashVoucherById(_id: String!): PurchasingPettyCashVoucher
    @checkPermissions(permissions: [PURCHASING_VIEW_PETTY_CASH, PURCHASING_MANAGE_PETTY_CASH_VOUCHERS, PURCHASING_APPROVE_PETTY_CASH_VOUCHERS])

  pagedPurchasingPettyCashVouchers(
    search: String
    status: String
    fundId: String
    expenseHeadId: String
    replenishmentId: String
    unreplenishedOnly: Boolean
    pageIndex: Int
    pageSize: Int
  ): PagedPurchasingPettyCashVouchers
    @checkPermissions(permissions: [PURCHASING_VIEW_PETTY_CASH, PURCHASING_MANAGE_PETTY_CASH_VOUCHERS, PURCHASING_APPROVE_PETTY_CASH_VOUCHERS, PURCHASING_MANAGE_PETTY_CASH_FUNDS])
}

extend type Mutation {
  createPurchasingPettyCashVoucher(
    fundId: String!
    expenseHeadId: String!
    voucherDate: String!
    payee: String
    vendorId: String
    purpose: String
    lines: [PurchasingPettyCashVoucherLineInput!]!
  ): PurchasingPettyCashVoucher
    @checkPermissions(permissions: [PURCHASING_MANAGE_PETTY_CASH_VOUCHERS])

  updatePurchasingPettyCashVoucher(
    _id: String!
    expenseHeadId: String!
    voucherDate: String!
    payee: String
    vendorId: String
    purpose: String
    lines: [PurchasingPettyCashVoucherLineInput!]!
  ): PurchasingPettyCashVoucher
    @checkPermissions(permissions: [PURCHASING_MANAGE_PETTY_CASH_VOUCHERS])

  submitPurchasingPettyCashVoucher(_id: String!): PurchasingPettyCashVoucher
    @checkPermissions(permissions: [PURCHASING_MANAGE_PETTY_CASH_VOUCHERS])

  deletePurchasingPettyCashVoucher(_id: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_PETTY_CASH_VOUCHERS])

  approvePurchasingPettyCashVoucher(_id: String!): PurchasingPettyCashVoucher
    @checkPermissions(permissions: [PURCHASING_APPROVE_PETTY_CASH_VOUCHERS])

  rejectPurchasingPettyCashVoucher(_id: String!, reason: String!): PurchasingPettyCashVoucher
    @checkPermissions(permissions: [PURCHASING_APPROVE_PETTY_CASH_VOUCHERS])

  voidPurchasingPettyCashVoucher(_id: String!, reason: String!): PurchasingPettyCashVoucher
    @checkPermissions(permissions: [PURCHASING_APPROVE_PETTY_CASH_VOUCHERS])
}
`;
