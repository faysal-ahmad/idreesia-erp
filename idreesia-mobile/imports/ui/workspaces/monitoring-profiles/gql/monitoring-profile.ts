import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddMobileWorkspaceMonitoringProfilePhotoMutation,
  AddMobileWorkspaceMonitoringProfilePhotoMutationVariables,
  MobileWorkspaceMonitoringProfileByIdQuery,
  MobileWorkspaceMonitoringProfileByIdQueryVariables,
  RemoveMobileWorkspaceMonitoringProfilePhotoMutation,
  RemoveMobileWorkspaceMonitoringProfilePhotoMutationVariables,
  UpdateMobileWorkspaceMonitoringProfileMutation,
  UpdateMobileWorkspaceMonitoringProfileMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

import { MOBILE_WORKSPACE_MONITORING_PROFILE_FIELDS } from './monitoring-profile-fields';

/** One profile (monitoring-profile-screen.tsx). */
export const MOBILE_WORKSPACE_MONITORING_PROFILE_BY_ID: TypedDocumentNode<
  MobileWorkspaceMonitoringProfileByIdQuery,
  MobileWorkspaceMonitoringProfileByIdQueryVariables
> = gql`
  query mobileWorkspaceMonitoringProfileById($committeeId: String!, $profileId: String!) {
    workspaceMonitoringProfileById(committeeId: $committeeId, profileId: $profileId) {
      ...MobileWorkspaceMonitoringProfileFields
    }
  }
  ${MOBILE_WORKSPACE_MONITORING_PROFILE_FIELDS}
`;

export const UPDATE_MOBILE_WORKSPACE_MONITORING_PROFILE: TypedDocumentNode<
  UpdateMobileWorkspaceMonitoringProfileMutation,
  UpdateMobileWorkspaceMonitoringProfileMutationVariables
> = gql`
  mutation updateMobileWorkspaceMonitoringProfile(
    $committeeId: String!
    $profileId: String!
    $name: String!
    $isTest: Boolean!
  ) {
    updateWorkspaceMonitoringProfile(
      committeeId: $committeeId
      profileId: $profileId
      name: $name
      isTest: $isTest
    ) {
      ...MobileWorkspaceMonitoringProfileFields
    }
  }
  ${MOBILE_WORKSPACE_MONITORING_PROFILE_FIELDS}
`;

export const ADD_MOBILE_WORKSPACE_MONITORING_PROFILE_PHOTO: TypedDocumentNode<
  AddMobileWorkspaceMonitoringProfilePhotoMutation,
  AddMobileWorkspaceMonitoringProfilePhotoMutationVariables
> = gql`
  mutation addMobileWorkspaceMonitoringProfilePhoto(
    $committeeId: String!
    $profileId: String!
    $imageData: String!
  ) {
    addWorkspaceMonitoringProfilePhoto(
      committeeId: $committeeId
      profileId: $profileId
      imageData: $imageData
    ) {
      ...MobileWorkspaceMonitoringProfileFields
    }
  }
  ${MOBILE_WORKSPACE_MONITORING_PROFILE_FIELDS}
`;

export const REMOVE_MOBILE_WORKSPACE_MONITORING_PROFILE_PHOTO: TypedDocumentNode<
  RemoveMobileWorkspaceMonitoringProfilePhotoMutation,
  RemoveMobileWorkspaceMonitoringProfilePhotoMutationVariables
> = gql`
  mutation removeMobileWorkspaceMonitoringProfilePhoto(
    $committeeId: String!
    $profileId: String!
    $photoId: String!
  ) {
    removeWorkspaceMonitoringProfilePhoto(
      committeeId: $committeeId
      profileId: $profileId
      photoId: $photoId
    ) {
      ...MobileWorkspaceMonitoringProfileFields
    }
  }
  ${MOBILE_WORKSPACE_MONITORING_PROFILE_FIELDS}
`;
