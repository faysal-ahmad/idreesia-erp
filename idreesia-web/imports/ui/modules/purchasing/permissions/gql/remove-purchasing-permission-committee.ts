import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemovePurchasingPermissionCommitteeMutation,
  RemovePurchasingPermissionCommitteeMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_PURCHASING_PERMISSION_COMMITTEE: TypedDocumentNode<
  RemovePurchasingPermissionCommitteeMutation,
  RemovePurchasingPermissionCommitteeMutationVariables
> = gql`
  mutation removePurchasingPermissionCommittee($permissionKey: String!, $committeeId: String!) {
    removePurchasingPermissionCommittee(permissionKey: $permissionKey, committeeId: $committeeId)
  }
`;

export default REMOVE_PURCHASING_PERMISSION_COMMITTEE;
