import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeleteStoreUserGroupMutation,
  DeleteStoreUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_STORE_USER_GROUP: TypedDocumentNode<DeleteStoreUserGroupMutation, DeleteStoreUserGroupMutationVariables> = gql`
  mutation deleteStoreUserGroup($_id: String!) {
    deleteStoreUserGroup(_id: $_id)
  }
`;

export default DELETE_STORE_USER_GROUP;
