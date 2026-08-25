import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateHrKarkunMutation,
  CreateHrKarkunMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_HR_KARKUN: TypedDocumentNode<
  CreateHrKarkunMutation,
  CreateHrKarkunMutationVariables
> = gql`
  mutation createHrKarkun(
    $name: String!
    $parentName: String
    $cnicNumber: String
    $contactNumber1: String
    $contactNumber2: String
    $emailAddress: String
    $currentAddress: String
    $permanentAddress: String
    $bloodGroup: String
    $educationalQualification: String
    $meansOfEarning: String
    $ehadDate: String
    $birthDate: String
    $referenceName: String
  ) {
    createHrKarkun(
      name: $name
      parentName: $parentName
      cnicNumber: $cnicNumber
      contactNumber1: $contactNumber1
      contactNumber2: $contactNumber2
      emailAddress: $emailAddress
      currentAddress: $currentAddress
      permanentAddress: $permanentAddress
      bloodGroup: $bloodGroup
      educationalQualification: $educationalQualification
      meansOfEarning: $meansOfEarning
      ehadDate: $ehadDate
      birthDate: $birthDate
      referenceName: $referenceName
    ) {
      _id
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
        referenceName
      }
      karkunData {
        lastTarteebDate
        mehfilRaabta
        msRaabta
      }
    }
  }
`;

export default CREATE_HR_KARKUN;
