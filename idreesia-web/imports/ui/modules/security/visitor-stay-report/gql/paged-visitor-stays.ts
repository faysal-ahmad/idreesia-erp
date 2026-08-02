import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ReportPagedVisitorStaysQuery,
  ReportPagedVisitorStaysQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_VISITOR_STAYS: TypedDocumentNode<
  ReportPagedVisitorStaysQuery,
  ReportPagedVisitorStaysQueryVariables
> = gql`
  query reportPagedVisitorStays($queryString: String!) {
    pagedVisitorStays(queryString: $queryString) {
      totalResults
      data {
        _id
        visitorId
        fromDate
        toDate
        numOfDays
        stayReason
        stayAllowedBy
        refVisitor {
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
  }
`;

export default PAGED_VISITOR_STAYS;
