import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveHrEmployeesPermissionUserMutation,
  RemoveHrEmployeesPermissionUserMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_HR_PERMISSION_USER: TypedDocumentNode<
  RemoveHrEmployeesPermissionUserMutation,
  RemoveHrEmployeesPermissionUserMutationVariables
> = gql`
  mutation removeHrEmployeesPermissionUser($permissionKey: String!, $userId: String!) {
    removeHrEmployeesPermissionUser(permissionKey: $permissionKey, userId: $userId)
  }
`;

export default REMOVE_HR_PERMISSION_USER;
