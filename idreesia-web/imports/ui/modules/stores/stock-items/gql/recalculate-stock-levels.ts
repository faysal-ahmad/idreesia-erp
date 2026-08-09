import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RecalculateStockLevelsMutation,
  RecalculateStockLevelsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const RECALCULATE_STOCK_LEVELS: TypedDocumentNode<
  RecalculateStockLevelsMutation,
  RecalculateStockLevelsMutationVariables
> = gql`
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
