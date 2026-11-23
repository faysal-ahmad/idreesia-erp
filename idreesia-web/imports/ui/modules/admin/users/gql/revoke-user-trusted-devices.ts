import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RevokeUserTrustedDevicesMutation,
  RevokeUserTrustedDevicesMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REVOKE_USER_TRUSTED_DEVICES: TypedDocumentNode<
  RevokeUserTrustedDevicesMutation,
  RevokeUserTrustedDevicesMutationVariables
> = gql`
  mutation revokeUserTrustedDevices($userId: String!) {
    revokeUserTrustedDevices(userId: $userId)
  }
`;

export default REVOKE_USER_TRUSTED_DEVICES;
