import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveHrEmployeesPermissionCommitteeMutation,
  RemoveHrEmployeesPermissionCommitteeMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_HR_PERMISSION_COMMITTEE: TypedDocumentNode<
  RemoveHrEmployeesPermissionCommitteeMutation,
  RemoveHrEmployeesPermissionCommitteeMutationVariables
> = gql`
  mutation removeHrEmployeesPermissionCommittee($permissionKey: String!, $committeeId: String!) {
    removeHrEmployeesPermissionCommittee(permissionKey: $permissionKey, committeeId: $committeeId)
  }
`;

export default REMOVE_HR_PERMISSION_COMMITTEE;
