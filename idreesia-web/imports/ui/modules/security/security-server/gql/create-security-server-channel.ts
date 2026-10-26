import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateSecurityServerChannelMutation,
  CreateSecurityServerChannelMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_SECURITY_SERVER_CHANNEL: TypedDocumentNode<
  CreateSecurityServerChannelMutation,
  CreateSecurityServerChannelMutationVariables
> = gql`
  mutation createSecurityServerChannel(
    $name: String!
    $enabled: Boolean!
    $similarityThreshold: Float
    $recognitionFps: Float!
    $connection: SecurityServerChannelConnectionInput!
  ) {
    createSecurityServerChannel(
      name: $name
      enabled: $enabled
      similarityThreshold: $similarityThreshold
      recognitionFps: $recognitionFps
      connection: $connection
    ) {
      _id
    }
  }
`;

export default CREATE_SECURITY_SERVER_CHANNEL;
