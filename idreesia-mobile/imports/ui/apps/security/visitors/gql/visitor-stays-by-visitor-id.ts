import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileVisitorStaysByVisitorIdQuery,
  MobileVisitorStaysByVisitorIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

/** A visitor's latest 5 stays, newest first (the server fixes the page size). */
export const MOBILE_VISITOR_STAYS_BY_VISITOR_ID: TypedDocumentNode<
  MobileVisitorStaysByVisitorIdQuery,
  MobileVisitorStaysByVisitorIdQueryVariables
> = gql`
  query mobileVisitorStaysByVisitorId($visitorId: String!) {
    pagedVisitorStaysByVisitorId(visitorId: $visitorId) {
      totalResults
      data {
        _id
        fromDate
        numOfDays
        cancelledDate
      }
    }
  }
`;
