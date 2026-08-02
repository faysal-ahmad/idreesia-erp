import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  VisitorStaysPagedVisitorStaysQuery,
  VisitorStaysPagedVisitorStaysQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_VISITOR_STAYS: TypedDocumentNode<
  VisitorStaysPagedVisitorStaysQuery,
  VisitorStaysPagedVisitorStaysQueryVariables
> = gql`
  query visitorStaysPagedVisitorStays($queryString: String!) {
    pagedVisitorStays(queryString: $queryString) {
      totalResults
      data {
        _id
        visitorId
        fromDate
        toDate
        numOfDays
        stayReason
        dutyShiftName
        cancelledDate
      }
    }
  }
`;

export default PAGED_VISITOR_STAYS;
