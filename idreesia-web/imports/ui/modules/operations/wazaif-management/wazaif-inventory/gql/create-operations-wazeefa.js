import gql from 'graphql-tag';

export const CREATE_OPERATIONS_WAZEEFA = gql`
  mutation createOperationsWazeefa(
    $name: String!
    $revisionNumber: Int
    $revisionDate: String
    $currentStockLevel: Int
  ) {
    createOperationsWazeefa(
      name: $name
      revisionNumber: $revisionNumber
      revisionDate: $revisionDate
      currentStockLevel: $currentStockLevel
    ) {
      _id
      name
      revisionNumber
      revisionDate
      currentStockLevel
    }
  }
`;
