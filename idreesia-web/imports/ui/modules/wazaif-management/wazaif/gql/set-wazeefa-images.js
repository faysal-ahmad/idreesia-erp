import gql from 'graphql-tag';

const SET_WAZEEFA_IMAGES = gql`
  mutation setWazeefaImages($_id: String!, $imageIds: [String]!) {
    setWazeefaImages(_id: $_id, imageIds: $imageIds) {
      _id
      name
      revisionNumber
      revisionDate
      imageIds
    }
  }
`;

export default SET_WAZEEFA_IMAGES;
