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
      sharedData {
        name
        parentName
        cnicNumber
        ehadDate
        birthDate
        referenceName
        contactNumber1
        contactNumber2
        currentAddress
        permanentAddress
        educationalQualification
        meansOfEarning
        imageId
        tagIds
        tags {
          _id
          name
          color
          textColor
        }
      }
      visitorData {
        city
        country
        criminalRecord
        otherNotes
      }
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default SECURITY_VISITOR_BY_ID;
