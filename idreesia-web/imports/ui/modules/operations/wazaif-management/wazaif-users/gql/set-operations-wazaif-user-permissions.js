import gql from 'graphql-tag';

const SET_OPERATIONS_WAZAIF_USER_PERMISSIONS = gql`
  mutation setOperationsWazaifUserPermissions(
    $userId: String!
    $permissions: [String]!
  ) {
    setOperationsWazaifUserPermissions(
      userId: $userId
      permissions: $permissions
    ) {
      _id
      permissions
    }
  }
`;

export default SET_OPERATIONS_WAZAIF_USER_PERMISSIONS;
