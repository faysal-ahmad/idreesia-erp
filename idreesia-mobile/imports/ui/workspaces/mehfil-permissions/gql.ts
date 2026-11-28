import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileAddMehfilPermissionUserMutation,
  MobileAddMehfilPermissionUserMutationVariables,
  MobileMehfilPermissionsKarkunSearchQuery,
  MobileMehfilPermissionsKarkunSearchQueryVariables,
  MobileMehfilPermissionsQuery,
  MobileMehfilPermissionsQueryVariables,
  MobileRemoveMehfilPermissionUserMutation,
  MobileRemoveMehfilPermissionUserMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

// Same server operations as the web's Workspaces → Mehfil Permissions page.

export const MOBILE_MEHFIL_PERMISSIONS: TypedDocumentNode<
  MobileMehfilPermissionsQuery,
  MobileMehfilPermissionsQueryVariables
> = gql`
  query mobileMehfilPermissions($locationId: String!) {
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

export const MOBILE_MEHFIL_PERMISSIONS_KARKUN_SEARCH: TypedDocumentNode<
  MobileMehfilPermissionsKarkunSearchQuery,
  MobileMehfilPermissionsKarkunSearchQueryVariables
> = gql`
  query mobileMehfilPermissionsKarkunSearch(
    $locationId: String!
    $name: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedWorkspaceMehfilPermissionsKarkuns(
      locationId: $locationId
      name: $name
      phoneNumber: $phoneNumber
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        name
        parentName
        contactNumber1
        imageUrl
        imageThumbnailUrl
      }
    }
  }
`;

export const MOBILE_ADD_MEHFIL_PERMISSION_USER: TypedDocumentNode<
  MobileAddMehfilPermissionUserMutation,
  MobileAddMehfilPermissionUserMutationVariables
> = gql`
  mutation mobileAddMehfilPermissionUser(
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

export const MOBILE_REMOVE_MEHFIL_PERMISSION_USER: TypedDocumentNode<
  MobileRemoveMehfilPermissionUserMutation,
  MobileRemoveMehfilPermissionUserMutationVariables
> = gql`
  mutation mobileRemoveMehfilPermissionUser(
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
