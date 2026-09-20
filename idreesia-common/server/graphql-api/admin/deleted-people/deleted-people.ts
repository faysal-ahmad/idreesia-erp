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
    @checkPermissions(permissions: [ADMIN_MANAGE_DELETED_DATA])

  deletedPersonById(_id: String!): PersonType
    @checkPermissions(permissions: [ADMIN_MANAGE_DELETED_DATA])

  deletedPersonRelationCounts(ids: [String!]!): [PersonRelationCounts!]!
    @checkPermissions(permissions: [ADMIN_MANAGE_DELETED_DATA])
}

extend type Mutation {
  hardDeletePerson(_id: String!): Int
    @checkPermissions(permissions: [ADMIN_MANAGE_DELETED_DATA])

  restorePerson(_id: String!): Int
    @checkPermissions(permissions: [ADMIN_MANAGE_DELETED_DATA])
}
`;
