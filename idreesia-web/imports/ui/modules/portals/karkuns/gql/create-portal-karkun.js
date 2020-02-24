import gql from 'graphql-tag';

const CREATE_PORTAL_KARKUN = gql`
  mutation createPortalKarkun(
    $portalId: String!
    $memberId: String!
    $cityId: String
  ) {
    createPortalKarkun(
      portalId: $portalId
      memberId: $memberId
      cityId: $cityId
    ) {
      _id
      name
      parentName
      cnicNumber
      contactNumber1
      contactNumber2
      emailAddress
      currentAddress
      permanentAddress
      cityId
      cityMehfilId
      bloodGroup
      educationalQualification
      meansOfEarning
      ehadDate
      referenceName
      imageId
    }
  }
`;

export default CREATE_PORTAL_KARKUN;
