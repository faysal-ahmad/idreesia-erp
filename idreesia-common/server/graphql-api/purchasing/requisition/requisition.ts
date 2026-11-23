import gql from 'graphql-tag';

export default gql`
type PurchasingRequisitionLine {
  _id: String
  catalogItemId: String
  description: String
  unit: String
  quantity: Float
  estimatedUnitPrice: Float
}

input PurchasingRequisitionLineInput {
  _id: String
  catalogItemId: String
  description: String
  unit: String
  quantity: Float!
  estimatedUnitPrice: Float
}

type PurchasingRequisition {
  _id: String
  number: String
  title: String
  purpose: String
  requestedBy: String
  requestedByPerson: PersonBasicType
  neededBy: String
  lines: [PurchasingRequisitionLine]
  estimatedTotal: Float
  status: String
  version: Int
  submittedAt: String
  submittedBy: String
  approvedAt: String
  approvedBy: String
  rejectedAt: String
  rejectedBy: String
  rejectionReason: String
  cancelledAt: String
  cancelledBy: String

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type PagedPurchasingRequisitions {
  totalResults: Int
  data: [PurchasingRequisition]
}

extend type Query {
  purchasingRequisitionById(_id: String!): PurchasingRequisition
    @checkPermissions(permissions: [PURCHASING_VIEW_REQUISITIONS, PURCHASING_MANAGE_REQUISITIONS, PURCHASING_APPROVE_REQUISITIONS, PURCHASING_MANAGE_ORDERS])

  pagedPurchasingRequisitions(
    search: String
    status: String
    requestedBy: String
    pageIndex: Int
    pageSize: Int
  ): PagedPurchasingRequisitions
    @checkPermissions(permissions: [PURCHASING_VIEW_REQUISITIONS, PURCHASING_MANAGE_REQUISITIONS, PURCHASING_APPROVE_REQUISITIONS, PURCHASING_MANAGE_ORDERS])
}

extend type Mutation {
  createPurchasingRequisition(
    title: String!
    purpose: String
    requestedBy: String
    neededBy: String
    lines: [PurchasingRequisitionLineInput!]!
  ): PurchasingRequisition
    @checkPermissions(permissions: [PURCHASING_MANAGE_REQUISITIONS])

  # Only a draft can be edited. version is the version that was loaded.
  updatePurchasingRequisition(
    _id: String!
    version: Int!
    title: String!
    purpose: String
    requestedBy: String
    neededBy: String
    lines: [PurchasingRequisitionLineInput!]!
  ): PurchasingRequisition
    @checkPermissions(permissions: [PURCHASING_MANAGE_REQUISITIONS])

  submitPurchasingRequisition(_id: String!): PurchasingRequisition
    @checkPermissions(permissions: [PURCHASING_MANAGE_REQUISITIONS])

  reopenPurchasingRequisition(_id: String!): PurchasingRequisition
    @checkPermissions(permissions: [PURCHASING_MANAGE_REQUISITIONS])

  cancelPurchasingRequisition(_id: String!): PurchasingRequisition
    @checkPermissions(permissions: [PURCHASING_MANAGE_REQUISITIONS])

  deletePurchasingRequisition(_id: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_REQUISITIONS])

  approvePurchasingRequisition(_id: String!): PurchasingRequisition
    @checkPermissions(permissions: [PURCHASING_APPROVE_REQUISITIONS])

  rejectPurchasingRequisition(_id: String!, reason: String!): PurchasingRequisition
    @checkPermissions(permissions: [PURCHASING_APPROVE_REQUISITIONS])
}
`;
