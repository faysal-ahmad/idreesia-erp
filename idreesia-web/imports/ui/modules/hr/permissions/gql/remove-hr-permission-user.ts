import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveHrPermissionUserMutation,
  RemoveHrPermissionUserMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_HR_PERMISSION_USER: TypedDocumentNode<
  RemoveHrPermissionUserMutation,
  RemoveHrPermissionUserMutationVariables
> = gql`
  mutation removeHrPermissionUser($permissionKey: String!, $userId: String!) {
    removeHrPermissionUser(permissionKey: $permissionKey, userId: $userId)
  }
`;

export default REMOVE_HR_PERMISSION_USER;
