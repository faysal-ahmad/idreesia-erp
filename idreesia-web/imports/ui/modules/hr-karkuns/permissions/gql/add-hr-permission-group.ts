import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddHrKarkunsPermissionGroupMutation,
  AddHrKarkunsPermissionGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_HR_PERMISSION_GROUP: TypedDocumentNode<
  AddHrKarkunsPermissionGroupMutation,
  AddHrKarkunsPermissionGroupMutationVariables
> = gql`
  mutation addHrKarkunsPermissionGroup($permissionKey: String!, $groupId: String!) {
    addHrKarkunsPermissionGroup(permissionKey: $permissionKey, groupId: $groupId)
  }
`;

export default ADD_HR_PERMISSION_GROUP;
