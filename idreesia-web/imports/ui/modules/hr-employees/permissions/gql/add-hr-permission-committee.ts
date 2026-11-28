import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddHrEmployeesPermissionCommitteeMutation,
  AddHrEmployeesPermissionCommitteeMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_HR_PERMISSION_COMMITTEE: TypedDocumentNode<
  AddHrEmployeesPermissionCommitteeMutation,
  AddHrEmployeesPermissionCommitteeMutationVariables
> = gql`
  mutation addHrEmployeesPermissionCommittee($permissionKey: String!, $committeeId: String!) {
    addHrEmployeesPermissionCommittee(permissionKey: $permissionKey, committeeId: $committeeId)
  }
`;

export default ADD_HR_PERMISSION_COMMITTEE;
