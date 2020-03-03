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
    $sharedResidenceId: String
    $educationalQualification: String
    $meansOfEarning: String
    $ehadDate: String
    $birthDate: String
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
      bloodGroup: $bloodGroup
      sharedResidenceId: $sharedResidenceId
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
      bloodGroup
      sharedResidenceId
      educationalQualification
      meansOfEarning
      ehadDate
      birthDate
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
