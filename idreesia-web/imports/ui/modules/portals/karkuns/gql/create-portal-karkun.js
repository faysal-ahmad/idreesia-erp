import gql from 'graphql-tag';

const CREATE_PORTAL_KARKUN = gql`
  mutation createPortalKarkun(
    $portalId: String!
    $name: String!
    $parentName: String
    $cnicNumber: String
    $contactNumber1: String
    $contactNumber2: String
    $emailAddress: String
    $currentAddress: String
    $permanentAddress: String
    $cityId: String
    $cityMehfilId: String
    $bloodGroup: String
    $educationalQualification: String
    $meansOfEarning: String
    $ehadDate: String
    $referenceName: String
    $imageId: String
  ) {
    createPortalKarkun(
      portalId: $portalId
      name: $name
      parentName: $parentName
      cnicNumber: $cnicNumber
      contactNumber1: $contactNumber1
      contactNumber2: $contactNumber2
      emailAddress: $emailAddress
      currentAddress: $currentAddress
      permanentAddress: $permanentAddress
      cityId: $cityId
      cityMehfilId: $cityMehfilId
      bloodGroup: $bloodGroup
      educationalQualification: $educationalQualification
      meansOfEarning: $meansOfEarning
      ehadDate: $ehadDate
      referenceName: $referenceName
      imageId: $imageId
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
