import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveSecurityPermissionGroupMutation,
  RemoveSecurityPermissionGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_SECURITY_PERMISSION_GROUP: TypedDocumentNode<
  RemoveSecurityPermissionGroupMutation,
  RemoveSecurityPermissionGroupMutationVariables
> = gql`
  mutation removeSecurityPermissionGroup($permissionKey: String!, $groupId: String!) {
    removeSecurityPermissionGroup(permissionKey: $permissionKey, groupId: $groupId)
  }
`;

export default REMOVE_SECURITY_PERMISSION_GROUP;
