import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';

import type {
  WorkspaceNightStaysQuery,
  WorkspaceNightStaysQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const WORKSPACE_NIGHT_STAYS: TypedDocumentNode<
  WorkspaceNightStaysQuery,
  WorkspaceNightStaysQueryVariables
> = gql`
  query workspaceNightStays(
    $committeeId: String!
    $stayDate: String!
    $name: String
    $city: String
    $stayReason: String
    $sortBy: String
    $sortOrder: String
    $pageIndex: String
    $pageSize: String
  ) {
    workspaceNightStays(
      committeeId: $committeeId
      stayDate: $stayDate
      name: $name
      city: $city
      stayReason: $stayReason
      sortBy: $sortBy
      sortOrder: $sortOrder
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        visitorId
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
