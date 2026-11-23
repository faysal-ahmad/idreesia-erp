import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemovePurchasingPermissionGroupMutation,
  RemovePurchasingPermissionGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_PURCHASING_PERMISSION_GROUP: TypedDocumentNode<
  RemovePurchasingPermissionGroupMutation,
  RemovePurchasingPermissionGroupMutationVariables
> = gql`
  mutation removePurchasingPermissionGroup($permissionKey: String!, $groupId: String!) {
    removePurchasingPermissionGroup(permissionKey: $permissionKey, groupId: $groupId)
  }
`;

export default REMOVE_PURCHASING_PERMISSION_GROUP;
