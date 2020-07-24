import gql from 'graphql-tag';

const CREATE_OPERATIONS_WAZEEFA = gql`
  mutation createOperationsWazeefa(
    $name: String!
    $revisionNumber: Int
    $revisionDate: String
  ) {
    createOperationsWazeefa(
      name: $name
      revisionNumber: $revisionNumber
      revisionDate: $revisionDate
    ) {
      _id
      name
      revisionNumber
      revisionDate
    }
  }
`;

export default CREATE_OPERATIONS_WAZEEFA;
