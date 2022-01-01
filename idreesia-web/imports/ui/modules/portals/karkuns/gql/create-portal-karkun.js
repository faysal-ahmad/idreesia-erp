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
    $cityId: String
    $cityMehfilId: String
    $permanentAddress: String
    $bloodGroup: String
    $educationalQualification: String
    $meansOfEarning: String
    $ehadDate: String
    $birthDate: String
    $referenceName: String
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
      cityId: $cityId
      cityMehfilId: $cityMehfilId
      permanentAddress: $permanentAddress
      bloodGroup: $bloodGroup
      educationalQualification: $educationalQualification
      meansOfEarning: $meansOfEarning
      ehadDate: $ehadDate
      birthDate: $birthDate
      referenceName: $referenceName
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
