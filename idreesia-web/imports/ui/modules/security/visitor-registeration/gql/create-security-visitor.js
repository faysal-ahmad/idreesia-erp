import gql from 'graphql-tag';

const CREATE_SECURITY_VISITOR = gql`
  mutation createSecurityVisitor(
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
    createSecurityVisitor(
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

export default CREATE_SECURITY_VISITOR;
