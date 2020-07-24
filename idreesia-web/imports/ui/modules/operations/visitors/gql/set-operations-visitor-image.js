import gql from 'graphql-tag';

const SET_OPERATIONS_VISITOR_IMAGE = gql`
  mutation setOperationsVisitorImage($_id: String!, $imageId: String!) {
    setOperationsVisitorImage(_id: $_id, imageId: $imageId) {
      _id
      imageId
    }
  }
`;

export default SET_OPERATIONS_VISITOR_IMAGE;
