import gql from 'graphql-tag';

const SET_PORTAL_MEMBER_IMAGE = gql`
  mutation setPortalMemberImage(
    $portalId: String!
    $_id: String!
    $imageId: String!
  ) {
    setPortalMemberImage(portalId: $portalId, _id: $_id, imageId: $imageId) {
      _id
      imageId
    }
  }
`;

export default SET_PORTAL_MEMBER_IMAGE;
