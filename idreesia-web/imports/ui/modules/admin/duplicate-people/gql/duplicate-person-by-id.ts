import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DuplicatePersonByIdQuery,
  DuplicatePersonByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DUPLICATE_PERSON_BY_ID: TypedDocumentNode<
  DuplicatePersonByIdQuery,
  DuplicatePersonByIdQueryVariables
> = gql`
  query duplicatePersonById($_id: String!) {
    duplicatePersonById(_id: $_id) {
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
      deletedAt
      deletedBy
    }
  }
`;

export default DUPLICATE_PERSON_BY_ID;
