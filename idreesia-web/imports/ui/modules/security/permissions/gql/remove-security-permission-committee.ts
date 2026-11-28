import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveSecurityPermissionCommitteeMutation,
  RemoveSecurityPermissionCommitteeMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_SECURITY_PERMISSION_COMMITTEE: TypedDocumentNode<
  RemoveSecurityPermissionCommitteeMutation,
  RemoveSecurityPermissionCommitteeMutationVariables
> = gql`
  mutation removeSecurityPermissionCommittee($permissionKey: String!, $committeeId: String!) {
    removeSecurityPermissionCommittee(permissionKey: $permissionKey, committeeId: $committeeId)
  }
`;

export default REMOVE_SECURITY_PERMISSION_COMMITTEE;
