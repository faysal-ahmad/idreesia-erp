import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddHrEmployeesPermissionGroupMutation,
  AddHrEmployeesPermissionGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_HR_PERMISSION_GROUP: TypedDocumentNode<
  AddHrEmployeesPermissionGroupMutation,
  AddHrEmployeesPermissionGroupMutationVariables
> = gql`
  mutation addHrEmployeesPermissionGroup($permissionKey: String!, $groupId: String!) {
    addHrEmployeesPermissionGroup(permissionKey: $permissionKey, groupId: $groupId)
  }
`;

export default ADD_HR_PERMISSION_GROUP;
