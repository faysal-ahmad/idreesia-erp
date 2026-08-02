import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  EditStockAdjustmentByIdQuery,
  EditStockAdjustmentByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const EDIT_STOCK_ADJUSTMENT_BY_ID: TypedDocumentNode<
  EditStockAdjustmentByIdQuery,
  EditStockAdjustmentByIdQueryVariables
> = gql`
  query editStockAdjustmentById($_id: String!, $physicalStoreId: String!) {
    stockAdjustmentById(_id: $_id, physicalStoreId: $physicalStoreId) {
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
