import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileMehfilDetailsQuery,
  MobileMehfilDetailsQueryVariables,
  MobileUpdateMehfilDetailsMutation,
  MobileUpdateMehfilDetailsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

// Same server operations as the web's Workspaces → Mehfil Details page.

export const MOBILE_MEHFIL_DETAILS: TypedDocumentNode<
  MobileMehfilDetailsQuery,
  MobileMehfilDetailsQueryVariables
> = gql`
  query mobileMehfilDetails($locationId: String!) {
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

export const MOBILE_UPDATE_MEHFIL_DETAILS: TypedDocumentNode<
  MobileUpdateMehfilDetailsMutation,
  MobileUpdateMehfilDetailsMutationVariables
> = gql`
  mutation mobileUpdateMehfilDetails($locationId: String!, $mehfilDetails: OrgLocationMehfilDetailsInput!) {
    workspaceUpdateMehfilDetails(locationId: $locationId, mehfilDetails: $mehfilDetails) {
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
