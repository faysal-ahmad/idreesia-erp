import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';

import type {
  MyMehfilPermissionsLocationsQuery,
  MyMehfilPermissionsLocationsQueryVariables,
  WorkspaceAddMehfilPermissionUserMutation,
  WorkspaceAddMehfilPermissionUserMutationVariables,
  WorkspaceMehfilPermissionsKarkunSearchQuery,
  WorkspaceMehfilPermissionsKarkunSearchQueryVariables,
  WorkspaceMehfilPermissionsQuery,
  WorkspaceMehfilPermissionsQueryVariables,
  WorkspaceRemoveMehfilPermissionUserMutation,
  WorkspaceRemoveMehfilPermissionUserMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const MY_MEHFIL_PERMISSIONS_LOCATIONS: TypedDocumentNode<
  MyMehfilPermissionsLocationsQuery,
  MyMehfilPermissionsLocationsQueryVariables
> = gql`
  query myMehfilPermissionsLocations {
    myMehfilPermissionsLocations {
      locationId
      name
      type
      parentId
      hasWorkspace
      permissions
    }
  }
`;

export const WORKSPACE_MEHFIL_PERMISSIONS: TypedDocumentNode<
  WorkspaceMehfilPermissionsQuery,
  WorkspaceMehfilPermissionsQueryVariables
> = gql`
  query workspaceMehfilPermissions($locationId: String!) {
    workspaceMehfilPermissions(locationId: $locationId) {
      locationId
      permissions
      groups {
        featureKey
        featureName
        permissions {
          key
          name
          description
          users {
            userId
            personId
            username
            displayName
          }
        }
      }
    }
  }
`;

export const WORKSPACE_MEHFIL_PERMISSIONS_KARKUN_SEARCH: TypedDocumentNode<
  WorkspaceMehfilPermissionsKarkunSearchQuery,
  WorkspaceMehfilPermissionsKarkunSearchQueryVariables
> = gql`
  query workspaceMehfilPermissionsKarkunSearch(
    $locationId: String!
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    workspaceMehfilPermissionsKarkunSearch(
      locationId: $locationId
      name: $name
      cnicNumber: $cnicNumber
      phoneNumber: $phoneNumber
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        name
        parentName
        cnicNumber
        contactNumber1
        imageUrl
        imageThumbnailUrl
      }
    }
  }
`;

export const WORKSPACE_ADD_MEHFIL_PERMISSION_USER: TypedDocumentNode<
  WorkspaceAddMehfilPermissionUserMutation,
  WorkspaceAddMehfilPermissionUserMutationVariables
> = gql`
  mutation workspaceAddMehfilPermissionUser(
    $locationId: String!
    $featureKey: String!
    $permissionKey: String!
    $karkunId: String!
  ) {
    workspaceAddMehfilPermissionUser(
      locationId: $locationId
      featureKey: $featureKey
      permissionKey: $permissionKey
      karkunId: $karkunId
    )
  }
`;

export const WORKSPACE_REMOVE_MEHFIL_PERMISSION_USER: TypedDocumentNode<
  WorkspaceRemoveMehfilPermissionUserMutation,
  WorkspaceRemoveMehfilPermissionUserMutationVariables
> = gql`
  mutation workspaceRemoveMehfilPermissionUser(
    $locationId: String!
    $featureKey: String!
    $permissionKey: String!
    $userId: String!
  ) {
    workspaceRemoveMehfilPermissionUser(
      locationId: $locationId
      featureKey: $featureKey
      permissionKey: $permissionKey
      userId: $userId
    )
  }
`;
