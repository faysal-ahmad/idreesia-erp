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
    @checkPermissions(permissions: [ADMIN_MANAGE_DUPLICATE_DATA])

  duplicatePhoneNumbers: [DuplicatePersonGroupType]
    @checkPermissions(permissions: [ADMIN_MANAGE_DUPLICATE_DATA])

  duplicatePersonById(_id: String!): PersonType
    @checkPermissions(permissions: [ADMIN_MANAGE_DUPLICATE_DATA])
}

extend type Mutation {
  deleteDuplicatePerson(_id: String!): Int
    @checkPermissions(permissions: [ADMIN_MANAGE_DUPLICATE_DATA])
}
`;
