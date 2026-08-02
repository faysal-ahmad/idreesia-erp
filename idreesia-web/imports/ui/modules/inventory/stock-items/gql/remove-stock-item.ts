import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveStockItemMutation,
  RemoveStockItemMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const REMOVE_STOCK_ITEM: TypedDocumentNode<
  RemoveStockItemMutation,
  RemoveStockItemMutationVariables
> = gql`
  mutation removeStockItem($_id: String!, $physicalStoreId: String!) {
    removeStockItem(_id: $_id, physicalStoreId: $physicalStoreId)
  }
`;
