import gql from 'graphql-tag';

export const RECALCULATE_STOCK_LEVELS = gql`
  mutation recalculateStockLevels($_ids: [String]!, $physicalStoreId: String!) {
    recalculateStockLevels(_ids: $_ids, physicalStoreId: $physicalStoreId) {
      _id
      currentStockLevel
      purchaseFormsCount
      issuanceFormsCount
      stockAdjustmentsCount
    }
  }
`;
