import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddPurchasingPermissionCommitteeMutation,
  AddPurchasingPermissionCommitteeMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_PURCHASING_PERMISSION_COMMITTEE: TypedDocumentNode<
  AddPurchasingPermissionCommitteeMutation,
  AddPurchasingPermissionCommitteeMutationVariables
> = gql`
  mutation addPurchasingPermissionCommittee($permissionKey: String!, $committeeId: String!) {
    addPurchasingPermissionCommittee(permissionKey: $permissionKey, committeeId: $committeeId)
  }
`;

export default ADD_PURCHASING_PERMISSION_COMMITTEE;
