import gql from 'graphql-tag';

export const MERGE_ATOCK_ITEMS = gql`
  mutation mergeStockItems(
    $_idToKeep: String!
    $_idsToMerge: [String]!
    $physicalStoreId: String!
  ) {
    mergeStockItems(
      _idToKeep: $_idToKeep
      _idsToMerge: $_idsToMerge
      physicalStoreId: $physicalStoreId
    ) {
      _id
      currentStockLevel
      purchaseFormsCount
      issuanceFormsCount
      stockAdjustmentsCount
    }
  }
`;
