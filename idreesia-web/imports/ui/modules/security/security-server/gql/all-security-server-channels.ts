import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AllSecurityServerChannelsQuery,
  AllSecurityServerChannelsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ALL_SECURITY_SERVER_CHANNELS: TypedDocumentNode<
  AllSecurityServerChannelsQuery,
  AllSecurityServerChannelsQueryVariables
> = gql`
  query allSecurityServerChannels($includeDeleted: Boolean) {
    allSecurityServerChannels(includeDeleted: $includeDeleted) {
      _id
      name
      enabled
      similarityThreshold
      recognitionFps
      alertsCount
      deletedAt
    }
  }
`;

export default ALL_SECURITY_SERVER_CHANNELS;
