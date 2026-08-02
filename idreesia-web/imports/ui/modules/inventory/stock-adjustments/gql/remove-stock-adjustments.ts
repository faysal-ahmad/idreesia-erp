import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveStockAdjustmentsMutation,
  RemoveStockAdjustmentsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const REMOVE_STOCK_ADJUSTMENTS: TypedDocumentNode<
  RemoveStockAdjustmentsMutation,
  RemoveStockAdjustmentsMutationVariables
> = gql`
  mutation removeStockAdjustments($physicalStoreId: String!, $_ids: [String]!) {
    removeStockAdjustments(physicalStoreId: $physicalStoreId, _ids: $_ids)
  }
`;
