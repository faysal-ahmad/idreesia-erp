import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddPurchasingPermissionUserMutation,
  AddPurchasingPermissionUserMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_PURCHASING_PERMISSION_USER: TypedDocumentNode<
  AddPurchasingPermissionUserMutation,
  AddPurchasingPermissionUserMutationVariables
> = gql`
  mutation addPurchasingPermissionUser($permissionKey: String!, $karkunId: String!) {
    addPurchasingPermissionUser(permissionKey: $permissionKey, karkunId: $karkunId)
  }
`;

export default ADD_PURCHASING_PERMISSION_USER;
