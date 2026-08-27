import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateSecurityVisitorMutation,
  UpdateSecurityVisitorMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_SECURITY_VISITOR: TypedDocumentNode<
  UpdateSecurityVisitorMutation,
  UpdateSecurityVisitorMutationVariables
> = gql`
  mutation updateSecurityVisitor(
    $_id: String!
    $name: String!
    $parentName: String!
    $cnicNumber: String
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
    updateSecurityVisitor(
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
    }
  }
`;

export default UPDATE_SECURITY_VISITOR;
