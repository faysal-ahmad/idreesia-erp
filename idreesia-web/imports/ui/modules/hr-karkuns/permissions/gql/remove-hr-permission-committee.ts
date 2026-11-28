import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveHrKarkunsPermissionCommitteeMutation,
  RemoveHrKarkunsPermissionCommitteeMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_HR_PERMISSION_COMMITTEE: TypedDocumentNode<
  RemoveHrKarkunsPermissionCommitteeMutation,
  RemoveHrKarkunsPermissionCommitteeMutationVariables
> = gql`
  mutation removeHrKarkunsPermissionCommittee($permissionKey: String!, $committeeId: String!) {
    removeHrKarkunsPermissionCommittee(permissionKey: $permissionKey, committeeId: $committeeId)
  }
`;

export default REMOVE_HR_PERMISSION_COMMITTEE;
