import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileEnrollTrustedDeviceMutation,
  MobileEnrollTrustedDeviceMutationVariables,
  MobileMyTrustedDevicesQuery,
  MobileMyTrustedDevicesQueryVariables,
  MobileRemoveTrustedDeviceMutation,
  MobileRemoveTrustedDeviceMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const MOBILE_MY_TRUSTED_DEVICES: TypedDocumentNode<
  MobileMyTrustedDevicesQuery,
  MobileMyTrustedDevicesQueryVariables
> = gql`
  query mobileMyTrustedDevices {
    myTrustedDevices {
      _id
      name
      createdAt
      lastUsedAt
    }
  }
`;

export const MOBILE_ENROLL_TRUSTED_DEVICE: TypedDocumentNode<
  MobileEnrollTrustedDeviceMutation,
  MobileEnrollTrustedDeviceMutationVariables
> = gql`
  mutation mobileEnrollTrustedDevice(
    $pin: String!
    $name: String
    $code: String
    $replaceDeviceId: String
  ) {
    enrollTrustedDevice(
      pin: $pin
      name: $name
      code: $code
      replaceDeviceId: $replaceDeviceId
    ) {
      deviceId
      deviceSecret
    }
  }
`;

export const MOBILE_REMOVE_TRUSTED_DEVICE: TypedDocumentNode<
  MobileRemoveTrustedDeviceMutation,
  MobileRemoveTrustedDeviceMutationVariables
> = gql`
  mutation mobileRemoveTrustedDevice($deviceId: String!) {
    removeTrustedDevice(deviceId: $deviceId)
  }
`;
