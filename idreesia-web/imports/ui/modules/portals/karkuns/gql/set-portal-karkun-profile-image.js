import gql from 'graphql-tag';

const SET_PORTAL_KARKUN_PROFILE_IMAGE = gql`
  mutation setPortalKarkunProfileImage(
    $portalId: String!
    $_id: String!
    $imageId: String!
  ) {
    setPortalKarkunProfileImage(
      portalId: $portalId
      _id: $_id
      imageId: $imageId
    ) {
      _id
      imageId
    }
  }
`;

export default SET_PORTAL_KARKUN_PROFILE_IMAGE;
