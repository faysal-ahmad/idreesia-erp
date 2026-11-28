import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddHrEmployeesPermissionUserMutation,
  AddHrEmployeesPermissionUserMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_HR_PERMISSION_USER: TypedDocumentNode<
  AddHrEmployeesPermissionUserMutation,
  AddHrEmployeesPermissionUserMutationVariables
> = gql`
  mutation addHrEmployeesPermissionUser($permissionKey: String!, $karkunId: String!) {
    addHrEmployeesPermissionUser(permissionKey: $permissionKey, karkunId: $karkunId)
  }
`;

export default ADD_HR_PERMISSION_USER;
