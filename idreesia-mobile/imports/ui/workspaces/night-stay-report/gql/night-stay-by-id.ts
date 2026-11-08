import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileWorkspaceNightStayByIdQuery,
  MobileWorkspaceNightStayByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

/** One stay from the Night Stay Report (night-stay-detail-screen.tsx). */
export const MOBILE_WORKSPACE_NIGHT_STAY_BY_ID: TypedDocumentNode<
  MobileWorkspaceNightStayByIdQuery,
  MobileWorkspaceNightStayByIdQueryVariables
> = gql`
  query mobileWorkspaceNightStayById($committeeId: String!, $stayId: String!) {
    workspaceNightStayById(committeeId: $committeeId, stayId: $stayId) {
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
      stayHistory {
        _id
        fromDate
        toDate
        numOfDays
        stayReason
      }
    }
  }
`;
