import gql from 'graphql-tag';

export const SET_OPERATIONS_WAZEEFA_STOCK_LEVEL = gql`
  mutation setOperationsWazeefaStockLevel(
    $_id: String!
    $currentStockLevel: Int
    $adjustmentReason: String
  ) {
    setOperationsWazeefaStockLevel(
      _id: $_id
      currentStockLevel: $currentStockLevel
      adjustmentReason: $adjustmentReason
    ) {
      _id
      currentStockLevel
      stockReconciledOn
    }
  }
`;
