import gql from 'graphql-tag';

export default gql`
input VisitorFilter {
  name: String
  cnicNumber: String
  phoneNumber: String
  city: String
  ehadDuration: String
  ehadDate: String
  additionalInfo: String
  dataSource: String
  updatedBetween: String
  tagId: String
  pageIndex: String
  pageSize: String
}

type PagedVisitorType {
  totalResults: Int
  data: [PersonType]
}

type FaceVectorResultType {
  # One of the ImageVectorStatus values: computed | no_face | multiple_faces | too_small | error
  status: String
  # Only populated when status is 'computed'
  vector: [Float!]
}

type VisitorFaceMatchType {
  person: PersonType
  # Raw cosine similarity, not Atlas' normalised score
  score: Float
}

extend type Query {
  pagedSecurityVisitors(filter: VisitorFilter): PagedVisitorType
  @checkPermissions(permissions: [SECURITY_VIEW_VISITORS, SECURITY_MANAGE_VISITORS])

  securityVisitorById(_id: String!): PersonType
  @checkPermissions(permissions: [SECURITY_VIEW_VISITORS, SECURITY_MANAGE_VISITORS])

  securityVisitorByCnic(cnicNumbers: [String]!): PersonType
  @checkPermissions(permissions: [SECURITY_VIEW_VISITORS, SECURITY_MANAGE_VISITORS])

  securityVisitorByCnicOrContactNumber(cnicNumber: String, contactNumber: String): PersonType
  @checkPermissions(permissions: [SECURITY_VIEW_VISITORS, SECURITY_MANAGE_VISITORS])

  # Step one of face search - embeds the captured photo and reports whether it is usable.
  # Deliberately does not search, so the capture dialog can report a bad photo and let the
  # operator retake without leaving the dialog.
  securityFaceVectorFromImage(imageData: String!): FaceVectorResultType
  @checkPermissions(permissions: [SECURITY_VIEW_VISITORS, SECURITY_MANAGE_VISITORS])

  # Step two - matches an already-computed vector against everyone who has one.
  securityVisitorsByFaceVector(vector: [Float!]!, limit: Int): [VisitorFaceMatchType]
  @checkPermissions(permissions: [SECURITY_VIEW_VISITORS, SECURITY_MANAGE_VISITORS])
}

extend type Mutation {
  createSecurityVisitor(
    name: String!
    parentName: String!
    cnicNumber: String
    ehadDate: String!
    birthDate: String
    referenceName: String!
    contactNumber1: String
    contactNumber2: String
    city: String
    country: String
    currentAddress: String
    permanentAddress: String
    educationalQualification: String
    meansOfEarning: String
    imageData: String
    tagIds: [String]
  ): PersonType
  @checkPermissions(permissions: [SECURITY_MANAGE_VISITORS])

  updateSecurityVisitor(
    _id: String!
    name: String!
    parentName: String!
    cnicNumber: String
    ehadDate: String!
    birthDate: String
    referenceName: String!
    contactNumber1: String
    contactNumber2: String
    city: String
    country: String
    currentAddress: String
    permanentAddress: String
    educationalQualification: String
    meansOfEarning: String
    tagIds: [String]
  ): PersonType
  @checkPermissions(permissions: [SECURITY_MANAGE_VISITORS])

  deleteSecurityVisitor(_id: String!): Int
  @checkPermissions(permissions: [SECURITY_DELETE_DATA])

  setSecurityVisitorImage(_id: String!, imageId: String!): PersonType
  @checkPermissions(permissions: [SECURITY_MANAGE_VISITORS])

  updateSecurityVisitorNotes(
    _id: String!
    criminalRecord: String
    otherNotes: String
  ): PersonType
  @checkPermissions(permissions: [SECURITY_MANAGE_VISITORS])

  importSecurityVisitorsCsvData(
    csvData: String!
  ): String
  @checkPermissions(permissions: [SECURITY_MANAGE_VISITORS])
}
`;
