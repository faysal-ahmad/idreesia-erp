import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddSecurityPermissionUserMutation,
  AddSecurityPermissionUserMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_SECURITY_PERMISSION_USER: TypedDocumentNode<
  AddSecurityPermissionUserMutation,
  AddSecurityPermissionUserMutationVariables
> = gql`
  mutation addSecurityPermissionUser($permissionKey: String!, $karkunId: String!) {
    addSecurityPermissionUser(permissionKey: $permissionKey, karkunId: $karkunId)
  }
`;

export default ADD_SECURITY_PERMISSION_USER;
