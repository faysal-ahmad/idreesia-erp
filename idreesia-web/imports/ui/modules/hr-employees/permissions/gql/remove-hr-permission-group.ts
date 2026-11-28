import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveHrEmployeesPermissionGroupMutation,
  RemoveHrEmployeesPermissionGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_HR_PERMISSION_GROUP: TypedDocumentNode<
  RemoveHrEmployeesPermissionGroupMutation,
  RemoveHrEmployeesPermissionGroupMutationVariables
> = gql`
  mutation removeHrEmployeesPermissionGroup($permissionKey: String!, $groupId: String!) {
    removeHrEmployeesPermissionGroup(permissionKey: $permissionKey, groupId: $groupId)
  }
`;

export default REMOVE_HR_PERMISSION_GROUP;
