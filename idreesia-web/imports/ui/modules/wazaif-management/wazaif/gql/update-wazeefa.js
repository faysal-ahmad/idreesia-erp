import gql from 'graphql-tag';

const UPDATE_WAZEEFA = gql`
  mutation updateWazeefa(
    $_id: String!
    $name: String!
    $revisionNumber: Int
    $revisionDate: String
  ) {
    updateWazeefa(
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

export default UPDATE_WAZEEFA;
