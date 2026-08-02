import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetSecurityUserPermissionsMutation,
  SetSecurityUserPermissionsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SET_SECURITY_USER_PERMISSIONS: TypedDocumentNode<
  SetSecurityUserPermissionsMutation,
  SetSecurityUserPermissionsMutationVariables
> = gql`
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
