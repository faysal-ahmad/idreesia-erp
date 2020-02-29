import gql from 'graphql-tag';

const CREATE_OUTSTATION_MEMBER = gql`
  mutation createOutstationMember(
    $name: String!
    $parentName: String!
    $cnicNumber: String!
    $ehadDate: String!
    $birthDate: String
    $referenceName: String!
    $contactNumber1: String
    $contactNumber2: String
    $address: String
    $city: String
    $country: String
  ) {
    createOutstationMember(
      name: $name
      parentName: $parentName
      cnicNumber: $cnicNumber
      ehadDate: $ehadDate
      birthDate: $birthDate
      referenceName: $referenceName
      contactNumber1: $contactNumber1
      contactNumber2: $contactNumber2
      address: $address
      city: $city
      country: $country
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
      address
      city
      country
    }
  }
`;

export default CREATE_OUTSTATION_MEMBER;
