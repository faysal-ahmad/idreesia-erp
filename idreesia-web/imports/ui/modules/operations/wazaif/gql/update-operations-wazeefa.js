import gql from 'graphql-tag';

const UPDATE_OPERATIONS_WAZEEFA = gql`
  mutation updateOperationsWazeefa(
    $_id: String!
    $name: String!
    $revisionNumber: Int
    $revisionDate: String
  ) {
    updateOperationsWazeefa(
      _id: $_id
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

export default UPDATE_OPERATIONS_WAZEEFA;
