import gql from 'graphql-tag';

const SET_PERMISSIONS = gql`
  mutation setPermissions($userId: String!, $permissions: [String]!) {
    setPermissions(userId: $userId, permissions: $permissions) {
      _id
      permissions
    }
  }
`;

export default SET_PERMISSIONS;
