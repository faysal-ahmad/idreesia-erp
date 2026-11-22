import gql from 'graphql-tag';

export default gql`
type PurchasingCatalogItem {
  _id: String
  name: String
  unit: String
  category: String
  description: String
  defaultUnitPrice: Float
  lastUnitPrice: Float
  lastVendorId: String
  isActive: Boolean

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type PagedPurchasingCatalogItems {
  totalResults: Int
  data: [PurchasingCatalogItem]
}

extend type Query {
  purchasingCatalogItemById(_id: String!): PurchasingCatalogItem
    @checkPermissions(permissions: [PURCHASING_MANAGE_CATALOG, PURCHASING_VIEW_REQUISITIONS, PURCHASING_MANAGE_REQUISITIONS, PURCHASING_VIEW_ORDERS, PURCHASING_MANAGE_ORDERS, PURCHASING_VIEW_INVOICES, PURCHASING_MANAGE_INVOICES])

  pagedPurchasingCatalogItems(
    search: String
    isActive: Boolean
    pageIndex: Int
    pageSize: Int
  ): PagedPurchasingCatalogItems
    @checkPermissions(permissions: [PURCHASING_MANAGE_CATALOG, PURCHASING_VIEW_REQUISITIONS, PURCHASING_MANAGE_REQUISITIONS, PURCHASING_VIEW_ORDERS, PURCHASING_MANAGE_ORDERS, PURCHASING_VIEW_INVOICES, PURCHASING_MANAGE_INVOICES])
}

extend type Mutation {
  createPurchasingCatalogItem(
    name: String!
    unit: String!
    category: String
    description: String
    defaultUnitPrice: Float
  ): PurchasingCatalogItem
    @checkPermissions(permissions: [PURCHASING_MANAGE_CATALOG])

  # Optional fields left out are cleared.
  updatePurchasingCatalogItem(
    _id: String!
    name: String!
    unit: String!
    category: String
    description: String
    defaultUnitPrice: Float
  ): PurchasingCatalogItem
    @checkPermissions(permissions: [PURCHASING_MANAGE_CATALOG])

  setPurchasingCatalogItemActive(
    _id: String!
    isActive: Boolean!
  ): PurchasingCatalogItem
    @checkPermissions(permissions: [PURCHASING_MANAGE_CATALOG])

  removePurchasingCatalogItem(_id: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_CATALOG])
}
`;
