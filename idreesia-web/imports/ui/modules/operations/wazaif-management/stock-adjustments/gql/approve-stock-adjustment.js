import gql from 'graphql-tag';

export const APPROVE_STOCK_ADJUSTMENT = gql`
  mutation approveStockAdjustment($_id: String!) {
    approveStockAdjustment(_id: $_id) {
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
