import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedSecurityVisitorsQuery,
  PagedSecurityVisitorsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_SECURITY_VISITORS: TypedDocumentNode<
  PagedSecurityVisitorsQuery,
  PagedSecurityVisitorsQueryVariables
> = gql`
  query pagedSecurityVisitors($filter: VisitorFilter) {
    pagedSecurityVisitors(filter: $filter) {
      totalResults
      data {
        _id
        name
        cnicNumber
        contactNumber1
        contactNumber2
        city
        country
        imageId
        criminalRecord
        otherNotes
      }
    }
  }
`;

export default PAGED_SECURITY_VISITORS;
