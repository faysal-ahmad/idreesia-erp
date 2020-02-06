import gql from 'graphql-tag';

const SET_PORTAL_VISITOR_IMAGE = gql`
  mutation setPortalVisitorImage(portalId: String!, $_id: String!, $imageId: String!) {
    setPortalVisitorImage(portalId: $portalId, _id: $_id, imageId: $imageId) {
      _id
      imageId
    }
  }
`;

export default SET_PORTAL_VISITOR_IMAGE;
