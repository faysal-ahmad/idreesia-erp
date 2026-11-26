import gql from 'graphql-tag';

export default gql`
type PurchasingPettyCashExpenseHead {
  _id: String
  name: String
  description: String
  isActive: Boolean
  # Whether any voucher is booked to it; a head in use can only be deactivated.
  inUse: Boolean
  version: Int

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type PagedPurchasingPettyCashExpenseHeads {
  totalResults: Int
  data: [PurchasingPettyCashExpenseHead]
}

extend type Query {
  purchasingPettyCashExpenseHeadById(_id: String!): PurchasingPettyCashExpenseHead
    @checkPermissions(permissions: [PURCHASING_VIEW_PETTY_CASH, PURCHASING_MANAGE_PETTY_CASH_FUNDS, PURCHASING_MANAGE_PETTY_CASH_VOUCHERS, PURCHASING_APPROVE_PETTY_CASH_VOUCHERS])

  pagedPurchasingPettyCashExpenseHeads(
    search: String
    isActive: Boolean
    pageIndex: Int
    pageSize: Int
  ): PagedPurchasingPettyCashExpenseHeads
    @checkPermissions(permissions: [PURCHASING_VIEW_PETTY_CASH, PURCHASING_MANAGE_PETTY_CASH_FUNDS, PURCHASING_MANAGE_PETTY_CASH_VOUCHERS, PURCHASING_APPROVE_PETTY_CASH_VOUCHERS])
}

extend type Mutation {
  createPurchasingPettyCashExpenseHead(name: String!, description: String): PurchasingPettyCashExpenseHead
    @checkPermissions(permissions: [PURCHASING_MANAGE_PETTY_CASH_FUNDS])

  updatePurchasingPettyCashExpenseHead(_id: String!, name: String!, description: String): PurchasingPettyCashExpenseHead
    @checkPermissions(permissions: [PURCHASING_MANAGE_PETTY_CASH_FUNDS])

  setPurchasingPettyCashExpenseHeadActive(_id: String!, isActive: Boolean!): PurchasingPettyCashExpenseHead
    @checkPermissions(permissions: [PURCHASING_MANAGE_PETTY_CASH_FUNDS])

  deletePurchasingPettyCashExpenseHead(_id: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_PETTY_CASH_FUNDS])
}
`;
