import gql from 'graphql-tag';

export default gql`
type PeopleTagType {
  _id: String
  name: String
  color: String
  textColor: String
  moduleNames: [String]
}

extend type Query {
  allPeopleTags: [PeopleTagType]
    @checkPermissions(permissions: [ADMIN_MANAGE_PEOPLE_TAGS])
}

extend type Mutation {
  createPeopleTag(
    name: String!
    color: String!
    textColor: String!
    moduleNames: [String]!
  ): PeopleTagType @checkPermissions(permissions: [ADMIN_MANAGE_PEOPLE_TAGS])

  updatePeopleTag(
    _id: String!
    name: String!
    color: String!
    textColor: String!
    moduleNames: [String]!
  ): PeopleTagType @checkPermissions(permissions: [ADMIN_MANAGE_PEOPLE_TAGS])

  deletePeopleTag(_id: String!): Int
    @checkPermissions(permissions: [ADMIN_MANAGE_PEOPLE_TAGS])
}
`;
