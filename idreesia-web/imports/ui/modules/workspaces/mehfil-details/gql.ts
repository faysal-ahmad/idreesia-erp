import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';

import type {
  MyMehfilDetailsLocationsQuery,
  MyMehfilDetailsLocationsQueryVariables,
  WorkspaceMehfilDetailsQuery,
  WorkspaceMehfilDetailsQueryVariables,
  WorkspaceUpdateMehfilDetailsMutation,
  WorkspaceUpdateMehfilDetailsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const MY_MEHFIL_DETAILS_LOCATIONS: TypedDocumentNode<
  MyMehfilDetailsLocationsQuery,
  MyMehfilDetailsLocationsQueryVariables
> = gql`
  query myMehfilDetailsLocations {
    myMehfilDetailsLocations {
      locationId
      name
      type
      parentId
      hasWorkspace
      permissions
    }
  }
`;

export const WORKSPACE_MEHFIL_DETAILS: TypedDocumentNode<
  WorkspaceMehfilDetailsQuery,
  WorkspaceMehfilDetailsQueryVariables
> = gql`
  query workspaceMehfilDetails($locationId: String!) {
    workspaceMehfilDetails(locationId: $locationId) {
      locationId
      name
      permissions
      mehfilDetails {
        address
        mehfilStartYear
        timingDetails
        lcdAvailability
        tabAvailability
        otherMehfilDetails
        latitude
        longitude
      }
    }
  }
`;

export const WORKSPACE_UPDATE_MEHFIL_DETAILS: TypedDocumentNode<
  WorkspaceUpdateMehfilDetailsMutation,
  WorkspaceUpdateMehfilDetailsMutationVariables
> = gql`
  mutation workspaceUpdateMehfilDetails(
    $locationId: String!
    $mehfilDetails: OrgLocationMehfilDetailsInput!
  ) {
    workspaceUpdateMehfilDetails(
      locationId: $locationId
      mehfilDetails: $mehfilDetails
    ) {
      locationId
      permissions
      mehfilDetails {
        address
        mehfilStartYear
        timingDetails
        lcdAvailability
        tabAvailability
        otherMehfilDetails
        latitude
        longitude
      }
    }
  }
`;
