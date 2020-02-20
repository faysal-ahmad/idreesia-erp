import gql from 'graphql-tag';

const SET_SECURITY_VISITOR_IMAGE = gql`
  mutation setSecurityVisitorImage($_id: String!, $imageId: String!) {
    setSecurityVisitorImage(_id: $_id, imageId: $imageId) {
      _id
      imageId
    }
  }
`;

export default SET_SECURITY_VISITOR_IMAGE;
