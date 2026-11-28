import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateHrEmployeeMutation,
  UpdateHrEmployeeMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_HR_EMPLOYEE: TypedDocumentNode<
  UpdateHrEmployeeMutation,
  UpdateHrEmployeeMutationVariables
> = gql`
  mutation updateHrEmployee(
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
    $cityLocationId: String
    $mehfilLocationId: String
    $educationalQualification: String
    $meansOfEarning: String
    $ehadDate: String
    $birthDate: String
    $deathDate: String
    $referenceName: String
  ) {
    updateHrEmployee(
      _id: $_id
      name: $name
      parentName: $parentName
      cnicNumber: $cnicNumber
      contactNumber1: $contactNumber1
      contactNumber2: $contactNumber2
      emailAddress: $emailAddress
      currentAddress: $currentAddress
      permanentAddress: $permanentAddress
      cityLocationId: $cityLocationId
      mehfilLocationId: $mehfilLocationId
      bloodGroup: $bloodGroup
      educationalQualification: $educationalQualification
      meansOfEarning: $meansOfEarning
      ehadDate: $ehadDate
      birthDate: $birthDate
      deathDate: $deathDate
      referenceName: $referenceName
    ) {
      _id
      createdAt
      createdBy
      updatedAt
      updatedBy
      sharedData {
        name
        parentName
        cnicNumber
        contactNumber1
        contactNumber2
        emailAddress
        currentAddress
        permanentAddress
        bloodGroup
        educationalQualification
        meansOfEarning
        ehadDate
        birthDate
        deathDate
        referenceName
      }
      karkunData {
        cityLocationId
        mehfilLocationId
        lastTarteebDate
        mehfilRaabta
        msRaabta
      }
    }
  }
`;

export default UPDATE_HR_EMPLOYEE;
