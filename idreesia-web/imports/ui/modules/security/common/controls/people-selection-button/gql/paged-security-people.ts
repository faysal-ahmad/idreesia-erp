import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedSecurityPeopleQuery,
  PagedSecurityPeopleQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_SECURITY_PEOPLE: TypedDocumentNode<
  PagedSecurityPeopleQuery,
  PagedSecurityPeopleQueryVariables
> = gql`
  query pagedSecurityPeople($filter: PersonFilter) {
    pagedSecurityPeople(filter: $filter) {
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
          imageUrl
          imageThumbnailUrl
        }
        visitorData {
          city
          country
        }
        karkunData {
          cityLocation {
            _id
            name
          }
        }
      }
    }
  }
`;

export default PAGED_SECURITY_PEOPLE;
