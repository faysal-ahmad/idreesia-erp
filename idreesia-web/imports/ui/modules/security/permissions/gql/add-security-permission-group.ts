import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddSecurityPermissionGroupMutation,
  AddSecurityPermissionGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_SECURITY_PERMISSION_GROUP: TypedDocumentNode<
  AddSecurityPermissionGroupMutation,
  AddSecurityPermissionGroupMutationVariables
> = gql`
  mutation addSecurityPermissionGroup($permissionKey: String!, $groupId: String!) {
    addSecurityPermissionGroup(permissionKey: $permissionKey, groupId: $groupId)
  }
`;

export default ADD_SECURITY_PERMISSION_GROUP;
