import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveHrKarkunsPermissionGroupMutation,
  RemoveHrKarkunsPermissionGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_HR_PERMISSION_GROUP: TypedDocumentNode<
  RemoveHrKarkunsPermissionGroupMutation,
  RemoveHrKarkunsPermissionGroupMutationVariables
> = gql`
  mutation removeHrKarkunsPermissionGroup($permissionKey: String!, $groupId: String!) {
    removeHrKarkunsPermissionGroup(permissionKey: $permissionKey, groupId: $groupId)
  }
`;

export default REMOVE_HR_PERMISSION_GROUP;
