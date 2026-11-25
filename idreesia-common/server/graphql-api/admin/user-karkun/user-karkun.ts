import gql from 'graphql-tag';

export default gql`
input AdminKarkunFilter {
  name: String
  cnicNumber: String
  phoneNumber: String
  cityLocationId: String
  mehfilLocationId: String
  pageIndex: String
  pageSize: String
}

type AdminKarkunLocationType {
  _id: String
  name: String
  type: String
  parentId: String
}

extend type Query {
  # Karkuns and employees (from any city) that a user account can be linked to.
  pagedAdminKarkuns(filter: AdminKarkunFilter): PagedKarkunType
    @checkPermissions(permissions: [ADMIN_MANAGE_USERS_AND_GROUPS])

  # The whole organization location tree, to filter karkuns and users by location.
  adminKarkunLocations: [AdminKarkunLocationType]
    @checkPermissions(permissions: [ADMIN_VIEW_USERS_AND_GROUPS, ADMIN_MANAGE_USERS_AND_GROUPS])
}
`;
