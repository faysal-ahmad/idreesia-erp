import gql from 'graphql-tag';

export default gql`
type IssuanceForm {
  _id: String
  issueDate: String
  issuedBy: String
  issuedTo: String
  handedOverTo: String
  locationId: String
  physicalStoreId: String
  items: [ItemWithQuantity]
  notes: String
  attachmentIds: [String]

  attachments: [Attachment]
  refLocation: Location
  refIssuedBy: PersonType
  refIssuedTo: PersonType
  refPhysicalStore: PhysicalStore

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
  approvedOn: String
  approvedBy: String
}

type PagedIssuanceForm {
  totalResults: Int
  data: [IssuanceForm]
}

extend type Query {
  issuanceFormById(
    _id: String!
    physicalStoreId: String!
  ): IssuanceForm
  @checkStoreAccess(permissions: [IN_VIEW_ISSUANCE_FORMS, IN_MANAGE_ISSUANCE_FORMS, IN_APPROVE_ISSUANCE_FORMS], physicalStoreIdArgName: "physicalStoreId", returnType: "object")

  issuanceFormsByStockItem(
    physicalStoreId: String!
    stockItemId: String!
  ): [IssuanceForm]
  @checkStoreAccess(permissions: [IN_VIEW_ISSUANCE_FORMS, IN_MANAGE_ISSUANCE_FORMS, IN_APPROVE_ISSUANCE_FORMS], physicalStoreIdArgName: "physicalStoreId", returnType: "list")

  issuanceFormsByMonth(
    physicalStoreId: String!
    month: String!
  ): [IssuanceForm]
  @checkStoreAccess(permissions: [IN_VIEW_ISSUANCE_FORMS, IN_MANAGE_ISSUANCE_FORMS, IN_APPROVE_ISSUANCE_FORMS], physicalStoreIdArgName: "physicalStoreId", returnType: "list")

  pagedIssuanceForms(
    physicalStoreId: String!
    queryString: String
  ): PagedIssuanceForm
  @checkStoreAccess(permissions: [IN_VIEW_ISSUANCE_FORMS, IN_MANAGE_ISSUANCE_FORMS, IN_APPROVE_ISSUANCE_FORMS], physicalStoreIdArgName: "physicalStoreId", returnType: "paged-list")
}

extend type Mutation {
  createIssuanceForm(
    issueDate: String!
    issuedBy: String!
    issuedTo: String!
    handedOverTo: String
    physicalStoreId: String!
    locationId: String
    items: [ItemWithQuantityInput]
    notes: String
  ): IssuanceForm
  @checkStoreAccess(permissions: [IN_MANAGE_ISSUANCE_FORMS], physicalStoreIdArgName: "physicalStoreId")

  updateIssuanceForm(
    _id: String!
    issueDate: String!
    issuedBy: String!
    issuedTo: String!
    handedOverTo: String
    physicalStoreId: String!
    locationId: String
    items: [ItemWithQuantityInput]
    notes: String
  ): IssuanceForm
  @checkStoreAccess(permissions: [IN_MANAGE_ISSUANCE_FORMS], physicalStoreIdArgName: "physicalStoreId")

  approveIssuanceForms(physicalStoreId: String!, _ids: [String]!): [IssuanceForm]
  @checkStoreAccess(permissions: [IN_APPROVE_ISSUANCE_FORMS], physicalStoreIdArgName: "physicalStoreId")

  addIssuanceFormAttachment(
    _id: String!
    physicalStoreId: String!
    attachmentId: String!
  ): IssuanceForm
  @checkStoreAccess(permissions: [IN_MANAGE_ISSUANCE_FORMS], physicalStoreIdArgName: "physicalStoreId")

  removeIssuanceFormAttachment(
    _id: String!
    physicalStoreId: String!
    attachmentId: String!
  ): IssuanceForm
  @checkStoreAccess(permissions: [IN_MANAGE_ISSUANCE_FORMS], physicalStoreIdArgName: "physicalStoreId")

  removeIssuanceForms(physicalStoreId: String!, _ids: [String]!): Int
  @checkStoreAccess(permissions: [IN_MANAGE_ISSUANCE_FORMS], physicalStoreIdArgName: "physicalStoreId")
}
`;
