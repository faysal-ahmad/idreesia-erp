import gql from 'graphql-tag';

const CREATE_WAZEEFA = gql`
  mutation createWazeefa(
    $name: String!
    $revisionNumber: Int
    $revisionDate: String
  ) {
    createWazeefa(
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

export default CREATE_WAZEEFA;
