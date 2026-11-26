import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateStoreUserGroupMutation,
  CreateStoreUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_STORE_USER_GROUP: TypedDocumentNode<CreateStoreUserGroupMutation, CreateStoreUserGroupMutationVariables> = gql`
  mutation createStoreUserGroup($name: String!, $description: String) {
    createStoreUserGroup(name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default CREATE_STORE_USER_GROUP;
