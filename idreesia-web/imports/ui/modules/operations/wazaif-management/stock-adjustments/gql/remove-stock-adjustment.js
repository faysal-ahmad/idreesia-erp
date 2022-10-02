import gql from 'graphql-tag';

export const REMOVE_STOCK_ADJUSTMENT = gql`
  mutation removeStockAdjustment($_id: String!) {
    removeStockAdjustment(_id: $_id)
  }
`;
