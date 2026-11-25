import gql from 'graphql-tag';

// A store raising requisitions with Purchasing for its own stock items. The
// requisition is a Purchasing document (PurchasingRequisition); the store only
// creates, submits and cancels its own, and Purchasing approves them.
export default gql`
extend type Query {
  storeRequisitionById(physicalStoreId: String!, _id: String!): PurchasingRequisition
    @checkStoreAccess(permissions: [IN_VIEW_REQUISITIONS, IN_MANAGE_REQUISITIONS], physicalStoreIdArgName: "physicalStoreId", returnType: "object")

  pagedStoreRequisitions(
    physicalStoreId: String!
    search: String
    status: String
    pageIndex: Int
    pageSize: Int
  ): PagedPurchasingRequisitions
    @checkStoreAccess(permissions: [IN_VIEW_REQUISITIONS, IN_MANAGE_REQUISITIONS], physicalStoreIdArgName: "physicalStoreId", returnType: "paged-list")
}

extend type Mutation {
  # Every line is one of the store's stock items (externalCatalogId).
  createStoreRequisition(
    physicalStoreId: String!
    title: String!
    purpose: String
    requestedBy: String
    neededBy: String
    lines: [PurchasingRequisitionLineInput!]!
  ): PurchasingRequisition
    @checkStoreAccess(permissions: [IN_MANAGE_REQUISITIONS], physicalStoreIdArgName: "physicalStoreId")

  # Only a draft can be edited. version is the version that was loaded.
  updateStoreRequisition(
    physicalStoreId: String!
    _id: String!
    version: Int!
    title: String!
    purpose: String
    requestedBy: String
    neededBy: String
    lines: [PurchasingRequisitionLineInput!]!
  ): PurchasingRequisition
    @checkStoreAccess(permissions: [IN_MANAGE_REQUISITIONS], physicalStoreIdArgName: "physicalStoreId")

  submitStoreRequisition(physicalStoreId: String!, _id: String!): PurchasingRequisition
    @checkStoreAccess(permissions: [IN_MANAGE_REQUISITIONS], physicalStoreIdArgName: "physicalStoreId")

  # A rejected requisition goes back to a draft so it can be fixed and resubmitted.
  reopenStoreRequisition(physicalStoreId: String!, _id: String!): PurchasingRequisition
    @checkStoreAccess(permissions: [IN_MANAGE_REQUISITIONS], physicalStoreIdArgName: "physicalStoreId")

  cancelStoreRequisition(physicalStoreId: String!, _id: String!): PurchasingRequisition
    @checkStoreAccess(permissions: [IN_MANAGE_REQUISITIONS], physicalStoreIdArgName: "physicalStoreId")

  deleteStoreRequisition(physicalStoreId: String!, _id: String!): Boolean
    @checkStoreAccess(permissions: [IN_MANAGE_REQUISITIONS], physicalStoreIdArgName: "physicalStoreId")
}
`;
