import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemovePurchasingPermissionUserMutation,
  RemovePurchasingPermissionUserMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_PURCHASING_PERMISSION_USER: TypedDocumentNode<
  RemovePurchasingPermissionUserMutation,
  RemovePurchasingPermissionUserMutationVariables
> = gql`
  mutation removePurchasingPermissionUser($permissionKey: String!, $userId: String!) {
    removePurchasingPermissionUser(permissionKey: $permissionKey, userId: $userId)
  }
`;

export default REMOVE_PURCHASING_PERMISSION_USER;
