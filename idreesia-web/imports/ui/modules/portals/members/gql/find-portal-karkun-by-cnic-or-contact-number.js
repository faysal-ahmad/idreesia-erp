import gql from 'graphql-tag';

const FIND_PORTAL_KARKUN_BY_CNIC_OR_CONTACT_NUMBER = gql`
  query findPortalKarkunByCnicOrContactNumber(
    $portalId: String!
    $cnicNumber: String
    $contactNumber: String
  ) {
    findPortalKarkunByCnicOrContactNumber(
      portalId: $portalId
      cnicNumber: $cnicNumber
      contactNumber: $contactNumber
    ) {
      _id
      name
      cnicNumber
      contactNumber1
      imageId
      cityId
      cityMehfilId
      city {
        _id
        name
      }
      cityMehfil {
        _id
        name
      }
    }
  }
`;

export default FIND_PORTAL_KARKUN_BY_CNIC_OR_CONTACT_NUMBER;
