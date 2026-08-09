import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ApproveStockAdjustmentsMutation,
  ApproveStockAdjustmentsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const APPROVE_STOCK_ADJUSTMENTS: TypedDocumentNode<
  ApproveStockAdjustmentsMutation,
  ApproveStockAdjustmentsMutationVariables
> = gql`
  mutation approveStockAdjustments(
    $physicalStoreId: String!
    $_ids: [String]!
  ) {
    approveStockAdjustments(physicalStoreId: $physicalStoreId, _ids: $_ids) {
      _id
      physicalStoreId
      stockItemId
      adjustmentDate
      adjustedBy
      quantity
      isInflow
      adjustmentReason
      approvedOn
      approvedBy
    }
  }
`;
