import gql from 'graphql-tag';

export const SET_OPERATIONS_WAZEEFA_IMAGE = gql`
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
