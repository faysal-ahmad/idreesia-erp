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
          sharedData {
            name
            imageId
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
  }
`;

export default PAGED_VISITOR_STAYS;
