import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdatePurchasingUserGroupMutation,
  UpdatePurchasingUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_PURCHASING_USER_GROUP: TypedDocumentNode<UpdatePurchasingUserGroupMutation, UpdatePurchasingUserGroupMutationVariables> = gql`
  mutation updatePurchasingUserGroup($_id: String!, $name: String!, $description: String) {
    updatePurchasingUserGroup(_id: $_id, name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default UPDATE_PURCHASING_USER_GROUP;
