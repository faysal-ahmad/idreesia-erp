import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  VerifyStockItemLevelMutation,
  VerifyStockItemLevelMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const VERIFY_STOCK_ITEM: TypedDocumentNode<
  VerifyStockItemLevelMutation,
  VerifyStockItemLevelMutationVariables
> = gql`
  mutation verifyStockItemLevel($_id: String!, $physicalStoreId: String!) {
    verifyStockItemLevel(_id: $_id, physicalStoreId: $physicalStoreId) {
      _id
      verifiedOn
    }
  }
`;
