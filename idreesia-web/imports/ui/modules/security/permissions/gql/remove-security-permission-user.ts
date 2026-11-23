import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveSecurityPermissionUserMutation,
  RemoveSecurityPermissionUserMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_SECURITY_PERMISSION_USER: TypedDocumentNode<
  RemoveSecurityPermissionUserMutation,
  RemoveSecurityPermissionUserMutationVariables
> = gql`
  mutation removeSecurityPermissionUser($permissionKey: String!, $userId: String!) {
    removeSecurityPermissionUser(permissionKey: $permissionKey, userId: $userId)
  }
`;

export default REMOVE_SECURITY_PERMISSION_USER;
