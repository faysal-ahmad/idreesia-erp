import gql from 'graphql-tag';

const SET_PORTAL_USER_PERMISSIONS = gql`
  mutation setPortalUserPermissions(
    $portalId: String!
    $userId: String!
    $permissions: [String]!
  ) {
    setPortalUserPermissions(
      portalId: $portalId
      userId: $userId
      permissions: $permissions
    ) {
      _id
      permissions
    }
  }
`;

export default SET_PORTAL_USER_PERMISSIONS;
