import gql from 'graphql-tag';

export const VERIFY_STOCK_ITEM = gql`
  mutation verifyStockItemLevel($_id: String!, $physicalStoreId: String!) {
    verifyStockItemLevel(_id: $_id, physicalStoreId: $physicalStoreId) {
      _id
      verifiedOn
    }
  }
`;
