import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateStockAdjustmentMutation,
  UpdateStockAdjustmentMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const UPDATE_STOCK_ADJUSTMENT: TypedDocumentNode<
  UpdateStockAdjustmentMutation,
  UpdateStockAdjustmentMutationVariables
> = gql`
  mutation updateStockAdjustment(
    $_id: String!
    $physicalStoreId: String!
    $adjustmentDate: String!
    $adjustedBy: String!
    $quantity: Float!
    $isInflow: Boolean!
    $adjustmentReason: String
  ) {
    updateStockAdjustment(
      _id: $_id
      physicalStoreId: $physicalStoreId
      adjustmentDate: $adjustmentDate
      adjustedBy: $adjustedBy
      quantity: $quantity
      isInflow: $isInflow
      adjustmentReason: $adjustmentReason
    ) {
      _id
      physicalStoreId
      stockItemId
      adjustmentDate
      adjustedBy
      quantity
      isInflow
      adjustmentReason
      createdAt
      createdBy
      updatedAt
      updatedBy
      refStockItem {
        _id
        name
        formattedName
      }
      refAdjustedBy {
        _id
        name
      }
    }
  }
`;
