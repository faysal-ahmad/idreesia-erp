import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveHrKarkunsPermissionUserMutation,
  RemoveHrKarkunsPermissionUserMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_HR_PERMISSION_USER: TypedDocumentNode<
  RemoveHrKarkunsPermissionUserMutation,
  RemoveHrKarkunsPermissionUserMutationVariables
> = gql`
  mutation removeHrKarkunsPermissionUser($permissionKey: String!, $userId: String!) {
    removeHrKarkunsPermissionUser(permissionKey: $permissionKey, userId: $userId)
  }
`;

export default REMOVE_HR_PERMISSION_USER;
