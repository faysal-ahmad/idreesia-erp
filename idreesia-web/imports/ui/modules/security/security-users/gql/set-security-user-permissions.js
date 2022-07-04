import gql from 'graphql-tag';

const SET_SECURITY_USER_PERMISSIONS = gql`
  mutation setSecurityUserPermissions(
    $userId: String!
    $permissions: [String]!
  ) {
    setSecurityUserPermissions(userId: $userId, permissions: $permissions) {
      _id
      permissions
    }
  }
`;

export default SET_SECURITY_USER_PERMISSIONS;
