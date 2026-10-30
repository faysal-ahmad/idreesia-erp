import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateSecurityServerChannelMutation,
  UpdateSecurityServerChannelMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_SECURITY_SERVER_CHANNEL: TypedDocumentNode<
  UpdateSecurityServerChannelMutation,
  UpdateSecurityServerChannelMutationVariables
> = gql`
  mutation updateSecurityServerChannel(
    $_id: String!
    $name: String!
    $enabled: Boolean!
    $similarityThreshold: Float
    $recognitionFps: Float!
    $minFaceSizePx: Int
    $minFaceQuality: Int
    $connection: SecurityServerChannelConnectionInput!
  ) {
    updateSecurityServerChannel(
      _id: $_id
      name: $name
      enabled: $enabled
      similarityThreshold: $similarityThreshold
      recognitionFps: $recognitionFps
      minFaceSizePx: $minFaceSizePx
      minFaceQuality: $minFaceQuality
      connection: $connection
    ) {
      _id
      name
      enabled
      similarityThreshold
      recognitionFps
      minFaceSizePx
      minFaceQuality
      connection {
        host
        port
        path
        username
        hasPassword
      }
      updatedAt
      updatedBy
    }
  }
`;

export default UPDATE_SECURITY_SERVER_CHANNEL;
