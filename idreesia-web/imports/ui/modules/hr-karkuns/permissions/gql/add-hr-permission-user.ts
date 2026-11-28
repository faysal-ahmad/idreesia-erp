import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddHrKarkunsPermissionUserMutation,
  AddHrKarkunsPermissionUserMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_HR_PERMISSION_USER: TypedDocumentNode<
  AddHrKarkunsPermissionUserMutation,
  AddHrKarkunsPermissionUserMutationVariables
> = gql`
  mutation addHrKarkunsPermissionUser($permissionKey: String!, $karkunId: String!) {
    addHrKarkunsPermissionUser(permissionKey: $permissionKey, karkunId: $karkunId)
  }
`;

export default ADD_HR_PERMISSION_USER;
