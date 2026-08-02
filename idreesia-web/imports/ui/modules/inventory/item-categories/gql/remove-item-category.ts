import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveItemCategoryMutation,
  RemoveItemCategoryMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const REMOVE_ITEM_CATEGORY: TypedDocumentNode<
  RemoveItemCategoryMutation,
  RemoveItemCategoryMutationVariables
> = gql`
  mutation removeItemCategory($_id: String!, $physicalStoreId: String!) {
    removeItemCategory(_id: $_id, physicalStoreId: $physicalStoreId)
  }
`;
