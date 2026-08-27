import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ViewStockAdjustmentByIdQuery,
  ViewStockAdjustmentByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const VIEW_STOCK_ADJUSTMENT_BY_ID: TypedDocumentNode<
  ViewStockAdjustmentByIdQuery,
  ViewStockAdjustmentByIdQueryVariables
> = gql`
  query viewStockAdjustmentById($_id: String!, $physicalStoreId: String!) {
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
      approvedOn
      approvedBy
      refStockItem {
        _id
        name
        formattedName
      }
      refAdjustedBy {
        _id
        sharedData {
          name
        }
      }
    }
  }
`;
