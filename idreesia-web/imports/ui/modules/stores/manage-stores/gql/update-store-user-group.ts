import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateStoreUserGroupMutation,
  UpdateStoreUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_STORE_USER_GROUP: TypedDocumentNode<UpdateStoreUserGroupMutation, UpdateStoreUserGroupMutationVariables> = gql`
  mutation updateStoreUserGroup($_id: String!, $name: String!, $description: String) {
    updateStoreUserGroup(_id: $_id, name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default UPDATE_STORE_USER_GROUP;
