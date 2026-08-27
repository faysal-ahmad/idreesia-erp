import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeletedPersonByIdQuery,
  DeletedPersonByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETED_PERSON_BY_ID: TypedDocumentNode<
  DeletedPersonByIdQuery,
  DeletedPersonByIdQueryVariables
> = gql`
  query deletedPersonById($_id: String!) {
    deletedPersonById(_id: $_id) {
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

export default DELETED_PERSON_BY_ID;
