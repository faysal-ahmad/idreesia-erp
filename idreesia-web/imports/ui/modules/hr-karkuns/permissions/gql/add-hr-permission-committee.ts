import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddHrKarkunsPermissionCommitteeMutation,
  AddHrKarkunsPermissionCommitteeMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_HR_PERMISSION_COMMITTEE: TypedDocumentNode<
  AddHrKarkunsPermissionCommitteeMutation,
  AddHrKarkunsPermissionCommitteeMutationVariables
> = gql`
  mutation addHrKarkunsPermissionCommittee($permissionKey: String!, $committeeId: String!) {
    addHrKarkunsPermissionCommittee(permissionKey: $permissionKey, committeeId: $committeeId)
  }
`;

export default ADD_HR_PERMISSION_COMMITTEE;
