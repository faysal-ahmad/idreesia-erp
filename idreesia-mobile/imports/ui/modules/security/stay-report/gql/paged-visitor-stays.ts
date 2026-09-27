import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobilePagedVisitorStaysQuery,
  MobilePagedVisitorStaysQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

/** Rows of the stay report (stay-report-screen.tsx). */
export const MOBILE_PAGED_VISITOR_STAYS: TypedDocumentNode<
  MobilePagedVisitorStaysQuery,
  MobilePagedVisitorStaysQueryVariables
> = gql`
  query mobilePagedVisitorStays($queryString: String!) {
    pagedVisitorStays(queryString: $queryString) {
      totalResults
      data {
        _id
        visitorId
        fromDate
        toDate
        numOfDays
        stayReason
        cancelledDate
        refVisitor {
          _id
          sharedData {
            name
            imageId
            imageThumbnailId
          }
          visitorData {
            city
            country
          }
        }
      }
    }
  }
`;
