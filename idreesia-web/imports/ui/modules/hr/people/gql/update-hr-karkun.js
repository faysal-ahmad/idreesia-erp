import gql from 'graphql-tag';

const UPDATE_HR_KARKUN = gql`
  mutation updateHrKarkun(
    $_id: String!
    $name: String!
    $parentName: String
    $cnicNumber: String
    $contactNumber1: String
    $contactNumber2: String
    $emailAddress: String
    $currentAddress: String
    $permanentAddress: String
    $bloodGroup: String
    $cityId: String
    $cityMehfilId: String
    $educationalQualification: String
    $meansOfEarning: String
    $ehadDate: String
    $birthDate: String
    $deathDate: String
    $referenceName: String
  ) {
    updateHrKarkun(
      _id: $_id
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
      birthDate: $birthDate
      deathDate: $deathDate
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
      birthDate
      deathDate
      lastTarteebDate
      mehfilRaabta
      msRaabta
      referenceName
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default UPDATE_HR_KARKUN;
