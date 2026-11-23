import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveHrPermissionGroupMutation,
  RemoveHrPermissionGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_HR_PERMISSION_GROUP: TypedDocumentNode<
  RemoveHrPermissionGroupMutation,
  RemoveHrPermissionGroupMutationVariables
> = gql`
  mutation removeHrPermissionGroup($permissionKey: String!, $groupId: String!) {
    removeHrPermissionGroup(permissionKey: $permissionKey, groupId: $groupId)
  }
`;

export default REMOVE_HR_PERMISSION_GROUP;
