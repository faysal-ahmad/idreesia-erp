import gql from 'graphql-tag';

export default gql`
extend type Query {
  pagedDeletedPeople(filter: PersonFilter): PagedPeopleType
    @checkPermissions(permissions: [ADMIN_MANAGE_DELETED_DATA])

  deletedPersonById(_id: String!): PersonType
    @checkPermissions(permissions: [ADMIN_MANAGE_DELETED_DATA])
}
`;
