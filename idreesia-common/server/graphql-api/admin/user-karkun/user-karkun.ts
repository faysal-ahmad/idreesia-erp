import gql from 'graphql-tag';

export default gql`
type AdminKarkunLocationType {
  _id: String
  name: String
  type: String
  parentId: String
}

extend type Query {
  # Karkuns and employees (from any city) that a user account can be linked to.
  pagedAdminUserKarkuns(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedPickerPersonType
    @checkPermissions(permissions: [ADMIN_MANAGE_USERS_AND_GROUPS])

  # The whole organization location tree, to filter karkuns and users by location.
  adminKarkunLocations: [AdminKarkunLocationType]
    @checkPermissions(permissions: [ADMIN_VIEW_USERS_AND_GROUPS, ADMIN_MANAGE_USERS_AND_GROUPS])
}
`;
