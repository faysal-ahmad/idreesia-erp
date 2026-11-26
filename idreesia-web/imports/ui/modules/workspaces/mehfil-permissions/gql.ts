import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';

import type {
  MyMehfilPermissionsLocationsQuery,
  MyMehfilPermissionsLocationsQueryVariables,
  WorkspaceAddMehfilPermissionUserMutation,
  WorkspaceAddMehfilPermissionUserMutationVariables,
  PagedWorkspaceMehfilPermissionsKarkunsQuery,
  PagedWorkspaceMehfilPermissionsKarkunsQueryVariables,
  WorkspaceMehfilPermissionsQuery,
  WorkspaceMehfilPermissionsQueryVariables,
  WorkspaceRemoveMehfilPermissionUserMutation,
  WorkspaceRemoveMehfilPermissionUserMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  PICKER_PERSON_FIELDS,
  type PersonSearchSource,
} from '/imports/ui/modules/helpers/controls/person-picker';

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

export const PAGED_WORKSPACE_MEHFIL_PERMISSIONS_KARKUNS: TypedDocumentNode<
  PagedWorkspaceMehfilPermissionsKarkunsQuery,
  PagedWorkspaceMehfilPermissionsKarkunsQueryVariables
> = gql`
  query pagedWorkspaceMehfilPermissionsKarkuns(
    $locationId: String!
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedWorkspaceMehfilPermissionsKarkuns(
      locationId: $locationId
      name: $name
      cnicNumber: $cnicNumber
      phoneNumber: $phoneNumber
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        ...PickerPersonFields
      }
    }
  }
  ${PICKER_PERSON_FIELDS}
`;

/** Karkuns of the mehfil with a user account; pass the mehfil as variables.locationId. */
export const mehfilPermissionsKarkunSource: PersonSearchSource<PagedWorkspaceMehfilPermissionsKarkunsQuery> = {
  query: PAGED_WORKSPACE_MEHFIL_PERMISSIONS_KARKUNS,
  select: data => data.pagedWorkspaceMehfilPermissionsKarkuns,
  description:
    'Showing karkuns whose mehfil is this location and who have a user account.',
};

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
