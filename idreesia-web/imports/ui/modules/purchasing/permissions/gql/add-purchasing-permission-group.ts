import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddPurchasingPermissionGroupMutation,
  AddPurchasingPermissionGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_PURCHASING_PERMISSION_GROUP: TypedDocumentNode<
  AddPurchasingPermissionGroupMutation,
  AddPurchasingPermissionGroupMutationVariables
> = gql`
  mutation addPurchasingPermissionGroup($permissionKey: String!, $groupId: String!) {
    addPurchasingPermissionGroup(permissionKey: $permissionKey, groupId: $groupId)
  }
`;

export default ADD_PURCHASING_PERMISSION_GROUP;
