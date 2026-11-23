import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddHrPermissionGroupMutation,
  AddHrPermissionGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_HR_PERMISSION_GROUP: TypedDocumentNode<
  AddHrPermissionGroupMutation,
  AddHrPermissionGroupMutationVariables
> = gql`
  mutation addHrPermissionGroup($permissionKey: String!, $groupId: String!) {
    addHrPermissionGroup(permissionKey: $permissionKey, groupId: $groupId)
  }
`;

export default ADD_HR_PERMISSION_GROUP;
