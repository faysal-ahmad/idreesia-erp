import gql from 'graphql-tag';

export const SET_OUTSTATION_PORTAL_USER_PERMISSIONS = gql`
  mutation setOutstationPortalUserPermissions(
    $userId: String!
    $permissions: [String]!
  ) {
    setOutstationPortalUserPermissions(
      userId: $userId
      permissions: $permissions
    ) {
      _id
      permissions
    }
  }
`;
