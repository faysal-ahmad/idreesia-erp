import gql from 'graphql-tag';

export default gql`
type PurchasingVendor {
  _id: String
  name: String
  contactPerson: String
  phone: String
  email: String
  address: String
  taxId: String
  paymentTermsDays: Int
  bankName: String
  bankAccountTitle: String
  bankAccountNumber: String
  notes: String
  isActive: Boolean

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type PagedPurchasingVendors {
  totalResults: Int
  data: [PurchasingVendor]
}

extend type Query {
  purchasingVendorById(_id: String!): PurchasingVendor
    @checkPermissions(permissions: [PURCHASING_VIEW_VENDORS, PURCHASING_MANAGE_VENDORS, PURCHASING_VIEW_ORDERS, PURCHASING_MANAGE_ORDERS, PURCHASING_VIEW_INVOICES, PURCHASING_MANAGE_INVOICES, PURCHASING_VIEW_PAYMENTS, PURCHASING_MANAGE_PAYMENTS])

  pagedPurchasingVendors(
    search: String
    isActive: Boolean
    pageIndex: Int
    pageSize: Int
  ): PagedPurchasingVendors
    @checkPermissions(permissions: [PURCHASING_VIEW_VENDORS, PURCHASING_MANAGE_VENDORS, PURCHASING_VIEW_ORDERS, PURCHASING_MANAGE_ORDERS, PURCHASING_VIEW_INVOICES, PURCHASING_MANAGE_INVOICES, PURCHASING_VIEW_PAYMENTS, PURCHASING_MANAGE_PAYMENTS])
}

extend type Mutation {
  createPurchasingVendor(
    name: String!
    contactPerson: String
    phone: String
    email: String
    address: String
    taxId: String
    paymentTermsDays: Int
    bankName: String
    bankAccountTitle: String
    bankAccountNumber: String
    notes: String
  ): PurchasingVendor
    @checkPermissions(permissions: [PURCHASING_MANAGE_VENDORS])

  # Optional fields left out are cleared.
  updatePurchasingVendor(
    _id: String!
    name: String!
    contactPerson: String
    phone: String
    email: String
    address: String
    taxId: String
    paymentTermsDays: Int
    bankName: String
    bankAccountTitle: String
    bankAccountNumber: String
    notes: String
  ): PurchasingVendor
    @checkPermissions(permissions: [PURCHASING_MANAGE_VENDORS])

  setPurchasingVendorActive(_id: String!, isActive: Boolean!): PurchasingVendor
    @checkPermissions(permissions: [PURCHASING_MANAGE_VENDORS])

  removePurchasingVendor(_id: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_VENDORS])
}
`;
