import gql from 'graphql-tag';

export default gql`
type DuplicatePersonSummaryType {
  _id: String
  name: String
  cnicNumber: String
  contactNumber1: String
  contactNumber2: String
  imageId: String
  imageThumbnailId: String
  updatedAt: String
}

type DuplicatePersonGroupType {
  value: String
  count: Int
  people: [DuplicatePersonSummaryType]
}

extend type Query {
  duplicateCnics: [DuplicatePersonGroupType]
    @checkPermissions(permissions: [ADMIN_MANAGE_DUPLICATE_PEOPLE])

  duplicatePhoneNumbers: [DuplicatePersonGroupType]
    @checkPermissions(permissions: [ADMIN_MANAGE_DUPLICATE_PEOPLE])

  duplicatePersonById(_id: String!): PersonType
    @checkPermissions(permissions: [ADMIN_MANAGE_DUPLICATE_PEOPLE])

  duplicatePersonRelationCounts(ids: [String!]!): [PersonRelationCounts!]
    @checkPermissions(permissions: [ADMIN_MANAGE_DUPLICATE_PEOPLE])
}

extend type Mutation {
  deleteDuplicatePeople(_ids: [String]!): Int
    @checkPermissions(permissions: [ADMIN_MANAGE_DUPLICATE_PEOPLE])
}
`;
