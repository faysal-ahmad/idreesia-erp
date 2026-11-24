import gql from 'graphql-tag';

export default gql`
type Vendor {
  _id: String
  physicalStoreId: String
  name: String
  contactPerson: String
  contactNumber: String
  address: String
  notes: String

  usageCount: Int

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

extend type Query {
  vendorById(_id: String!, physicalStoreId: String!): Vendor
  @checkStoreAccess(permissions: [IN_MANAGE_SETUP_DATA], physicalStoreIdArgName: "physicalStoreId", returnType: "object")

  vendorsByPhysicalStoreId(physicalStoreId: String!): [Vendor]
  @checkStoreAccess(permissions: [IN_MANAGE_SETUP_DATA, IN_VIEW_PURCHASE_FORMS, IN_MANAGE_PURCHASE_FORMS, IN_APPROVE_PURCHASE_FORMS], physicalStoreIdArgName: "physicalStoreId", returnType: "list")
}

extend type Mutation {
  createVendor(
    name: String!
    physicalStoreId: String!
    contactPerson: String
    contactNumber: String
    address: String
    notes: String
  ): Vendor
  @checkStoreAccess(permissions: [IN_MANAGE_SETUP_DATA], physicalStoreIdArgName: "physicalStoreId")

  updateVendor(
    _id: String!
    physicalStoreId: String!
    name: String
    contactPerson: String
    contactNumber: String
    address: String
    notes: String
  ): Vendor
  @checkStoreAccess(permissions: [IN_MANAGE_SETUP_DATA], physicalStoreIdArgName: "physicalStoreId")

  removeVendor(_id: String!, physicalStoreId: String!): Int
  @checkStoreAccess(permissions: [IN_MANAGE_SETUP_DATA], physicalStoreIdArgName: "physicalStoreId")
}
`;
