import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedPeopleQuery,
  PagedPeopleQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_PEOPLE: TypedDocumentNode<
  PagedPeopleQuery,
  PagedPeopleQueryVariables
> = gql`
  query pagedPeople($filter: PersonFilter) {
    pagedPeople(filter: $filter) {
      totalResults
      data {
        _id
        isVisitor
        isKarkun
        isEmployee
        sharedData {
          name
          cnicNumber
          contactNumber1
          contactNumber2
          imageId
          image {
            _id
            name
            description
            mimeType
            data
          }
          imageThumbnail {
            _id
            data
          }
        }
        visitorData {
          city
          country
        }
        karkunData {
          city {
            _id
            name
            country
          }
        }
      }
    }
  }
`;

export default PAGED_PEOPLE;
