import gql from 'graphql-tag';

export default gql`
type PurchasingPettyCashFund {
  _id: String
  name: String
  custodianPersonId: String
  custodian: PersonBasicType
  floatAmount: Float
  perTransactionLimit: Float
  balance: Float
  isActive: Boolean
  notes: String
  version: Int

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type PagedPurchasingPettyCashFunds {
  totalResults: Int
  data: [PurchasingPettyCashFund]
}

extend type Query {
  purchasingPettyCashFundById(_id: String!): PurchasingPettyCashFund
    @checkPermissions(permissions: [PURCHASING_VIEW_PETTY_CASH, PURCHASING_MANAGE_PETTY_CASH_FUNDS, PURCHASING_MANAGE_PETTY_CASH_VOUCHERS])

  # People to choose from as a fund's custodian: those who hold a Purchasing permission.
  pagedPurchasingCustodianKarkuns(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedPickerPersonType
    @checkPermissions(permissions: [PURCHASING_MANAGE_PETTY_CASH_FUNDS])

  pagedPurchasingPettyCashFunds(
    search: String
    isActive: Boolean
    pageIndex: Int
    pageSize: Int
  ): PagedPurchasingPettyCashFunds
    @checkPermissions(permissions: [PURCHASING_VIEW_PETTY_CASH, PURCHASING_MANAGE_PETTY_CASH_FUNDS, PURCHASING_MANAGE_PETTY_CASH_VOUCHERS])
}

extend type Mutation {
  createPurchasingPettyCashFund(
    name: String!
    custodianPersonId: String!
    floatAmount: Float!
    perTransactionLimit: Float
    notes: String
  ): PurchasingPettyCashFund
    @checkPermissions(permissions: [PURCHASING_MANAGE_PETTY_CASH_FUNDS])

  updatePurchasingPettyCashFund(
    _id: String!
    name: String!
    custodianPersonId: String!
    floatAmount: Float!
    perTransactionLimit: Float
    notes: String
  ): PurchasingPettyCashFund
    @checkPermissions(permissions: [PURCHASING_MANAGE_PETTY_CASH_FUNDS])

  setPurchasingPettyCashFundActive(_id: String!, isActive: Boolean!): PurchasingPettyCashFund
    @checkPermissions(permissions: [PURCHASING_MANAGE_PETTY_CASH_FUNDS])
}
`;
