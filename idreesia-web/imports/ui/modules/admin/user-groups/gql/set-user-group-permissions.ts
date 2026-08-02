import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetUserGroupPermissionsMutation,
  SetUserGroupPermissionsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SET_USER_GROUP_PERMISSIONS: TypedDocumentNode<
  SetUserGroupPermissionsMutation,
  SetUserGroupPermissionsMutationVariables
> = gql`
  mutation setUserGroupPermissions($_id: String!, $permissions: [String]!) {
    setUserGroupPermissions(_id: $_id, permissions: $permissions) {
      _id
      permissions
    }
  }
`;

export default SET_USER_GROUP_PERMISSIONS;
