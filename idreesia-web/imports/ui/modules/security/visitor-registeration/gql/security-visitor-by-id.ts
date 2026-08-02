import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityRegistrationVisitorByIdQuery,
  SecurityRegistrationVisitorByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SECURITY_VISITOR_BY_ID: TypedDocumentNode<
  SecurityRegistrationVisitorByIdQuery,
  SecurityRegistrationVisitorByIdQueryVariables
> = gql`
  query securityRegistrationVisitorById($_id: String!) {
    securityVisitorById(_id: $_id) {
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
      criminalRecord
      otherNotes
      imageId
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default SECURITY_VISITOR_BY_ID;
