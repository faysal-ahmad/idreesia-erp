import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveHrPermissionCommitteeMutation,
  RemoveHrPermissionCommitteeMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_HR_PERMISSION_COMMITTEE: TypedDocumentNode<
  RemoveHrPermissionCommitteeMutation,
  RemoveHrPermissionCommitteeMutationVariables
> = gql`
  mutation removeHrPermissionCommittee($permissionKey: String!, $committeeId: String!) {
    removeHrPermissionCommittee(permissionKey: $permissionKey, committeeId: $committeeId)
  }
`;

export default REMOVE_HR_PERMISSION_COMMITTEE;
