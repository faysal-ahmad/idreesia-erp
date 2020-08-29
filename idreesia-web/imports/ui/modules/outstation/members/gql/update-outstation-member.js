import gql from 'graphql-tag';

const UPDATE_OUTSTATION_MEMBER = gql`
  mutation updateOutstationMember(
    $_id: String!
    $name: String!
    $parentName: String!
    $cnicNumber: String!
    $ehadDate: String!
    $birthDate: String
    $referenceName: String!
    $contactNumber1: String
    $contactNumber2: String
    $city: String
    $country: String
    $currentAddress: String
    $permanentAddress: String
    $educationalQualification: String
    $meansOfEarning: String
  ) {
    updateOutstationMember(
      _id: $_id
      name: $name
      parentName: $parentName
      cnicNumber: $cnicNumber
      ehadDate: $ehadDate
      birthDate: $birthDate
      referenceName: $referenceName
      contactNumber1: $contactNumber1
      contactNumber2: $contactNumber2
      city: $city
      country: $country
      currentAddress: $currentAddress
      permanentAddress: $permanentAddress
      educationalQualification: $educationalQualification
      meansOfEarning: $meansOfEarning
    ) {
      _id
      name
      parentName
      cnicNumber
      ehadDate
      birthDate
      referenceName
      contactNumber1
      contactNumber2
      city
      country
      currentAddress
      permanentAddress
      educationalQualification
      meansOfEarning
    }
  }
`;

export default UPDATE_OUTSTATION_MEMBER;
