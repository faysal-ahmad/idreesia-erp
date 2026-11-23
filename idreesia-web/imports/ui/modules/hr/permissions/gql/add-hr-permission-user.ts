import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddHrPermissionUserMutation,
  AddHrPermissionUserMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_HR_PERMISSION_USER: TypedDocumentNode<
  AddHrPermissionUserMutation,
  AddHrPermissionUserMutationVariables
> = gql`
  mutation addHrPermissionUser($permissionKey: String!, $karkunId: String!) {
    addHrPermissionUser(permissionKey: $permissionKey, karkunId: $karkunId)
  }
`;

export default ADD_HR_PERMISSION_USER;
