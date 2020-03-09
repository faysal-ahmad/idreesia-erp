import gql from 'graphql-tag';

const IMPORT_OUTSTATION_MEMBER = gql`
  mutation importOutstationMember(
    $name: String!
    $parentName: String
    $cnicNumber: String
    $contactNumber1: String
    $cityId: String
    $ehadDate: String
    $birthDate: String
    $referenceName: String
  ) {
    importOutstationMember(
      name: $name
      parentName: $parentName
      cnicNumber: $cnicNumber
      contactNumber1: $contactNumber1
      cityId: $cityId
      ehadDate: $ehadDate
      birthDate: $birthDate
      referenceName: $referenceName
    )
  }
`;

export default IMPORT_OUTSTATION_MEMBER;
