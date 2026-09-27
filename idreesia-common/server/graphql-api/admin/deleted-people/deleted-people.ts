import gql from 'graphql-tag';

export default gql`
type PersonRelationCountType {
  name: String!
  count: Int!
}

type PersonRelationCounts {
  personId: String!
  total: Int!
  counts: [PersonRelationCountType!]!
}

extend type Query {
  pagedDeletedPeople(filter: PersonFilter): PagedPeopleType
    @checkPermissions(permissions: [ADMIN_MANAGE_DELETED_PEOPLE])

  deletedPersonById(_id: String!): PersonType
    @checkPermissions(permissions: [ADMIN_MANAGE_DELETED_PEOPLE])

  deletedPersonRelationCounts(ids: [String!]!): [PersonRelationCounts!]
    @checkPermissions(permissions: [ADMIN_MANAGE_DELETED_PEOPLE])
}

extend type Mutation {
  hardDeletePeople(_ids: [String!]!): Int
    @checkPermissions(permissions: [ADMIN_MANAGE_DELETED_PEOPLE])

  restorePerson(_id: String!): Int
    @checkPermissions(permissions: [ADMIN_MANAGE_DELETED_PEOPLE])
}
`;
