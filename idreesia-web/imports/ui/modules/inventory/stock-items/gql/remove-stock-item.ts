import gql from 'graphql-tag';

export const REMOVE_STOCK_ITEM = gql`
  mutation removeStockItem($_id: String!, $physicalStoreId: String!) {
    removeStockItem(_id: $_id, physicalStoreId: $physicalStoreId)
  }
`;
