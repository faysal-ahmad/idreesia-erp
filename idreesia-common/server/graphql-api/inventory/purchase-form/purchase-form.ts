import gql from 'graphql-tag';

export default gql`
type PurchaseForm {
  _id: String
  purchaseDate: String
  receivedBy: String
  purchasedBy: String
  locationId: String
  physicalStoreId: String
  vendorId: String
  items: [ItemWithQuantityAndPrice]
  notes: String
  attachmentIds: [String]

  attachments: [Attachment]
  refVendor: Vendor
  refLocation: Location
  refReceivedBy: PersonType
  refPurchasedBy: PersonType
  refPhysicalStore: PhysicalStore

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
  approvedOn: String
  approvedBy: String
}

type PagedPurchaseForm {
  totalResults: Int
  data: [PurchaseForm]
}

extend type Query {
  purchaseFormById(
    _id: String!
    physicalStoreId: String!
  ): PurchaseForm
  @checkStoreAccess(permissions: [IN_VIEW_PURCHASE_FORMS, IN_MANAGE_PURCHASE_FORMS, IN_APPROVE_PURCHASE_FORMS], physicalStoreIdArgName: "physicalStoreId", returnType: "object")

  purchaseFormsByStockItem(
    physicalStoreId: String!
    stockItemId: String!
  ): [PurchaseForm]
  @checkStoreAccess(permissions: [IN_VIEW_PURCHASE_FORMS, IN_MANAGE_PURCHASE_FORMS, IN_APPROVE_PURCHASE_FORMS], physicalStoreIdArgName: "physicalStoreId", returnType: "list")

  purchaseFormsByMonth(
    physicalStoreId: String!
    month: String!
  ): [PurchaseForm]
  @checkStoreAccess(permissions: [IN_VIEW_PURCHASE_FORMS, IN_MANAGE_PURCHASE_FORMS, IN_APPROVE_PURCHASE_FORMS], physicalStoreIdArgName: "physicalStoreId", returnType: "list")

  pagedPurchaseForms(
    physicalStoreId: String!
    queryString: String
  ): PagedPurchaseForm
  @checkStoreAccess(permissions: [IN_VIEW_PURCHASE_FORMS, IN_MANAGE_PURCHASE_FORMS, IN_APPROVE_PURCHASE_FORMS], physicalStoreIdArgName: "physicalStoreId", returnType: "paged-list")
}

extend type Mutation {
  createPurchaseForm(
    physicalStoreId: String!
    purchaseDate: String!
    receivedBy: String!
    purchasedBy: String!
    locationId: String
    vendorId: String
    items: [ItemWithQuantityAndPriceInput]
    notes: String
  ): PurchaseForm
  @checkStoreAccess(permissions: [IN_MANAGE_PURCHASE_FORMS], physicalStoreIdArgName: "physicalStoreId")

  updatePurchaseForm(
    _id: String!
    physicalStoreId: String!
    purchaseDate: String!
    receivedBy: String!
    purchasedBy: String!
    locationId: String
    vendorId: String
    items: [ItemWithQuantityAndPriceInput]
    notes: String
  ): PurchaseForm
  @checkStoreAccess(permissions: [IN_MANAGE_PURCHASE_FORMS], physicalStoreIdArgName: "physicalStoreId")

  approvePurchaseForms(physicalStoreId: String!, _ids: [String]!): [PurchaseForm]
  @checkStoreAccess(permissions: [IN_APPROVE_PURCHASE_FORMS], physicalStoreIdArgName: "physicalStoreId")

  addPurchaseFormAttachment(
    _id: String!
    physicalStoreId: String!
    attachmentId: String!
  ): PurchaseForm
  @checkStoreAccess(permissions: [IN_MANAGE_PURCHASE_FORMS], physicalStoreIdArgName: "physicalStoreId")

  removePurchaseFormAttachment(
    _id: String!
    physicalStoreId: String!
    attachmentId: String!
  ): PurchaseForm
  @checkStoreAccess(permissions: [IN_MANAGE_PURCHASE_FORMS], physicalStoreIdArgName: "physicalStoreId")

  removePurchaseForms(physicalStoreId: String!, _ids: [String]!): Int
  @checkStoreAccess(permissions: [IN_MANAGE_PURCHASE_FORMS], physicalStoreIdArgName: "physicalStoreId")
}
`;
