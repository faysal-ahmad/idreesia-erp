import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetPermissionsMutation,
  SetPermissionsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SET_PERMISSIONS: TypedDocumentNode<
  SetPermissionsMutation,
  SetPermissionsMutationVariables
> = gql`
  mutation setPermissions($userId: String!, $permissions: [String]!) {
    setPermissions(userId: $userId, permissions: $permissions) {
      _id
      permissions
    }
  }
`;

export default SET_PERMISSIONS;
