import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileWorkspaceNightStaysQuery,
  MobileWorkspaceNightStaysQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

/** Rows of the Night Stay Report (night-stay-report-screen.tsx). */
export const MOBILE_WORKSPACE_NIGHT_STAYS: TypedDocumentNode<
  MobileWorkspaceNightStaysQuery,
  MobileWorkspaceNightStaysQueryVariables
> = gql`
  query mobileWorkspaceNightStays(
    $committeeId: String!
    $stayDate: String!
    $pageIndex: String
    $pageSize: String
  ) {
    workspaceNightStays(
      committeeId: $committeeId
      stayDate: $stayDate
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        fromDate
        toDate
        numOfDays
        stayReason
        stayAllowedBy
        visitorName
        visitorImageUrl
        visitorImageThumbnailUrl
        city
        country
      }
    }
  }
`;
