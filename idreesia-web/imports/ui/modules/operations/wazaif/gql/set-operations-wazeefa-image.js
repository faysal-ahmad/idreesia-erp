import gql from 'graphql-tag';

const SET_OPERATIONS_WAZEEFA_IMAGE = gql`
  mutation setOperationsWazeefaImage($_id: String!, $imageIds: [String]!) {
    setOperationsWazeefaImage(_id: $_id, imageIds: $imageIds) {
      _id
      name
      revisionNumber
      revisionDate
      imageIds
    }
  }
`;

export default SET_OPERATIONS_WAZEEFA_IMAGE;
