import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeleteUserGroupMutation,
  DeleteUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_USER_GROUP: TypedDocumentNode<
  DeleteUserGroupMutation,
  DeleteUserGroupMutationVariables
> = gql`
  mutation deleteUserGroup($_id: String!) {
    deleteUserGroup(_id: $_id)
  }
`;

export default DELETE_USER_GROUP;
