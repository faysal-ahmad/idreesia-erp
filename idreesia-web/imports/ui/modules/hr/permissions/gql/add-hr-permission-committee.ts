import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddHrPermissionCommitteeMutation,
  AddHrPermissionCommitteeMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_HR_PERMISSION_COMMITTEE: TypedDocumentNode<
  AddHrPermissionCommitteeMutation,
  AddHrPermissionCommitteeMutationVariables
> = gql`
  mutation addHrPermissionCommittee($permissionKey: String!, $committeeId: String!) {
    addHrPermissionCommittee(permissionKey: $permissionKey, committeeId: $committeeId)
  }
`;

export default ADD_HR_PERMISSION_COMMITTEE;
