import gql from 'graphql-tag';

export default gql`
type PurchasingPettyCashReplenishment {
  _id: String
  number: String
  fundId: String
  fund: PurchasingPettyCashFund
  voucherIds: [String]
  amount: Float
  countedCash: Float
  variance: Float
  notes: String
  status: String
  version: Int
  approvedAt: String
  approvedBy: String
  rejectedAt: String
  rejectedBy: String
  rejectionReason: String

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type PagedPurchasingPettyCashReplenishments {
  totalResults: Int
  data: [PurchasingPettyCashReplenishment]
}

extend type Query {
  purchasingPettyCashReplenishmentById(_id: String!): PurchasingPettyCashReplenishment
    @checkPermissions(permissions: [PURCHASING_VIEW_PETTY_CASH, PURCHASING_MANAGE_PETTY_CASH_VOUCHERS, PURCHASING_APPROVE_PETTY_CASH_REPLENISHMENTS])

  pagedPurchasingPettyCashReplenishments(
    search: String
    status: String
    fundId: String
    pageIndex: Int
    pageSize: Int
  ): PagedPurchasingPettyCashReplenishments
    @checkPermissions(permissions: [PURCHASING_VIEW_PETTY_CASH, PURCHASING_MANAGE_PETTY_CASH_VOUCHERS, PURCHASING_APPROVE_PETTY_CASH_REPLENISHMENTS])
}

extend type Mutation {
  requestPurchasingPettyCashReplenishment(
    fundId: String!
    voucherIds: [String]
    countedCash: Float
    notes: String
  ): PurchasingPettyCashReplenishment
    @checkPermissions(permissions: [PURCHASING_MANAGE_PETTY_CASH_VOUCHERS])

  approvePurchasingPettyCashReplenishment(_id: String!): PurchasingPettyCashReplenishment
    @checkPermissions(permissions: [PURCHASING_APPROVE_PETTY_CASH_REPLENISHMENTS])

  rejectPurchasingPettyCashReplenishment(_id: String!, reason: String!): PurchasingPettyCashReplenishment
    @checkPermissions(permissions: [PURCHASING_APPROVE_PETTY_CASH_REPLENISHMENTS])
}
`;
