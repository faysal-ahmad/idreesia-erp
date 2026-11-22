import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileMyCommitteeLocationsQuery,
  MobileMyCommitteeLocationsQueryVariables,
  MobileMyDutiesAttendanceLocationsQuery,
  MobileMyDutiesAttendanceLocationsQueryVariables,
  MobileMyMehfilDetailsLocationsQuery,
  MobileMyMehfilDetailsLocationsQueryVariables,
  MobileMyMehfilPermissionsLocationsQuery,
  MobileMyMehfilPermissionsLocationsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

// The locations behind the Workspaces tab's location selector: where the
// user's committees are, and where they can open a location feature. Each
// includes the location's ancestors, so the selector can show the hierarchy.
// Same server queries as the web's Workspaces sidebar.
export const MOBILE_MY_COMMITTEE_LOCATIONS: TypedDocumentNode<
  MobileMyCommitteeLocationsQuery,
  MobileMyCommitteeLocationsQueryVariables
> = gql`
  query mobileMyCommitteeLocations {
    myCommitteeLocations {
      _id
      name
      type
      parentId
    }
  }
`;

export const MOBILE_MY_DUTIES_ATTENDANCE_LOCATIONS: TypedDocumentNode<
  MobileMyDutiesAttendanceLocationsQuery,
  MobileMyDutiesAttendanceLocationsQueryVariables
> = gql`
  query mobileMyDutiesAttendanceLocations {
    myDutiesAttendanceLocations {
      locationId
      name
      type
      parentId
      hasWorkspace
    }
  }
`;

export const MOBILE_MY_MEHFIL_DETAILS_LOCATIONS: TypedDocumentNode<
  MobileMyMehfilDetailsLocationsQuery,
  MobileMyMehfilDetailsLocationsQueryVariables
> = gql`
  query mobileMyMehfilDetailsLocations {
    myMehfilDetailsLocations {
      locationId
      name
      type
      parentId
      hasWorkspace
    }
  }
`;

export const MOBILE_MY_MEHFIL_PERMISSIONS_LOCATIONS: TypedDocumentNode<
  MobileMyMehfilPermissionsLocationsQuery,
  MobileMyMehfilPermissionsLocationsQueryVariables
> = gql`
  query mobileMyMehfilPermissionsLocations {
    myMehfilPermissionsLocations {
      locationId
      name
      type
      parentId
      hasWorkspace
    }
  }
`;
