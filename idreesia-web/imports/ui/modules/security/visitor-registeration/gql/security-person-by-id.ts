import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityRegistrationPersonByIdQuery,
  SecurityRegistrationPersonByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SECURITY_PERSON_BY_ID: TypedDocumentNode<
  SecurityRegistrationPersonByIdQuery,
  SecurityRegistrationPersonByIdQueryVariables
> = gql`
  query securityRegistrationPersonById($_id: String!) {
    securityPersonById(_id: $_id) {
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

export default SECURITY_PERSON_BY_ID;
