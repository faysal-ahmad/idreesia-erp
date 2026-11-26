import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddSecurityPermissionCommitteeMutation,
  AddSecurityPermissionCommitteeMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_SECURITY_PERMISSION_COMMITTEE: TypedDocumentNode<
  AddSecurityPermissionCommitteeMutation,
  AddSecurityPermissionCommitteeMutationVariables
> = gql`
  mutation addSecurityPermissionCommittee($permissionKey: String!, $committeeId: String!) {
    addSecurityPermissionCommittee(permissionKey: $permissionKey, committeeId: $committeeId)
  }
`;

export default ADD_SECURITY_PERMISSION_COMMITTEE;
