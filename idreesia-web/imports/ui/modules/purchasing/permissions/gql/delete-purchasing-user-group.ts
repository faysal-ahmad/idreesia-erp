import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeletePurchasingUserGroupMutation,
  DeletePurchasingUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_PURCHASING_USER_GROUP: TypedDocumentNode<DeletePurchasingUserGroupMutation, DeletePurchasingUserGroupMutationVariables> = gql`
  mutation deletePurchasingUserGroup($_id: String!) {
    deletePurchasingUserGroup(_id: $_id)
  }
`;

export default DELETE_PURCHASING_USER_GROUP;
