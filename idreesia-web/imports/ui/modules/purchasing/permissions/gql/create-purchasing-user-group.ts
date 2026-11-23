import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreatePurchasingUserGroupMutation,
  CreatePurchasingUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_PURCHASING_USER_GROUP: TypedDocumentNode<CreatePurchasingUserGroupMutation, CreatePurchasingUserGroupMutationVariables> = gql`
  mutation createPurchasingUserGroup($name: String!, $description: String) {
    createPurchasingUserGroup(name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default CREATE_PURCHASING_USER_GROUP;
