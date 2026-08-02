import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MergeStockItemsMutation,
  MergeStockItemsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const MERGE_ATOCK_ITEMS: TypedDocumentNode<
  MergeStockItemsMutation,
  MergeStockItemsMutationVariables
> = gql`
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
