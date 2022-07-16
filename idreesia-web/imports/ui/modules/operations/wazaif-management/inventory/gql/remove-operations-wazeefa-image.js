import gql from 'graphql-tag';

export const REMOVE_OPERATIONS_WAZEEFA_IMAGE = gql`
  mutation removeOperationsWazeefaImage($_id: String!, $imageId: String!) {
    removeOperationsWazeefaImage(_id: $_id, imageId: $imageId) {
      _id
      name
      revisionNumber
      revisionDate
      imageIds
    }
  }
`;
