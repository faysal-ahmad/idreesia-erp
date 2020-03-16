import gql from 'graphql-tag';

const LINK_PORTAL_KARKUN = gql`
  mutation linkPortalKarkun(
    $portalId: String!
    $memberId: String!
    $karkunId: String!
  ) {
    linkPortalKarkun(
      portalId: $portalId
      memberId: $memberId
      karkunId: $karkunId
    ) {
      _id
      name
      cnicNumber
      contactNumber1
      imageId
      cityId
      cityMehfilId
    }
  }
`;

export default LINK_PORTAL_KARKUN;
