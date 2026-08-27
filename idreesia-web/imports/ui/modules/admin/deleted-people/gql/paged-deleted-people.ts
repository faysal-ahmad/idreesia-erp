import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedDeletedPeopleQuery,
  PagedDeletedPeopleQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_DELETED_PEOPLE: TypedDocumentNode<
  PagedDeletedPeopleQuery,
  PagedDeletedPeopleQueryVariables
> = gql`
  query pagedDeletedPeople($filter: PersonFilter) {
    pagedDeletedPeople(filter: $filter) {
      totalResults
      data {
        _id
        isKarkun
        sharedData {
          name
          cnicNumber
          contactNumber1
          contactNumber2
          imageId
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
      }
    }
  }
`;

export default PAGED_DELETED_PEOPLE;
