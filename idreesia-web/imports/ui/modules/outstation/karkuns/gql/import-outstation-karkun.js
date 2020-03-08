import gql from 'graphql-tag';

const IMPORT_OUTSTATION_KARKUN = gql`
  mutation importOutstationKarkun(
    $name: String!
    $parentName: String
    $cnicNumber: String
    $contactNumber1: String
    $cityId: String
    $cityMehfilId: String
    $ehadDate: String
    $birthDate: String
    $referenceName: String
    $lastTarteebDate: String
    $mehfilRaabta: String
    $msRaabta: String
  ) {
    importOutstationKarkun(
      name: $name
      parentName: $parentName
      cnicNumber: $cnicNumber
      contactNumber1: $contactNumber1
      cityId: $cityId
      cityMehfilId: $cityMehfilId
      ehadDate: $ehadDate
      birthDate: $birthDate
      referenceName: $referenceName
      lastTarteebDate: $lastTarteebDate
      mehfilRaabta: $mehfilRaabta
      msRaabta: $msRaabta
    )
  }
`;

export default IMPORT_OUTSTATION_KARKUN;
