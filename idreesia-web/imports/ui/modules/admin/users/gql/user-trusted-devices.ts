import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UserTrustedDevicesQuery,
  UserTrustedDevicesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const USER_TRUSTED_DEVICES: TypedDocumentNode<
  UserTrustedDevicesQuery,
  UserTrustedDevicesQueryVariables
> = gql`
  query userTrustedDevices($userId: String!) {
    userTrustedDevices(userId: $userId) {
      _id
      name
      createdAt
      lastUsedAt
    }
  }
`;

export default USER_TRUSTED_DEVICES;
