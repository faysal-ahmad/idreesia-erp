import gql from 'graphql-tag';

const REMOVE_WAZEEFA_IMAGE = gql`
  mutation removeWazeefaImage($_id: String!, $imageId: String!) {
    removeWazeefaImage(_id: $_id, imageId: $imageId) {
      _id
      name
      revisionNumber
      revisionDate
      imageIds
    }
  }
`;

export default REMOVE_WAZEEFA_IMAGE;
