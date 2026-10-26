import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityServerChannelByIdQuery,
  SecurityServerChannelByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SECURITY_SERVER_CHANNEL_BY_ID: TypedDocumentNode<
  SecurityServerChannelByIdQuery,
  SecurityServerChannelByIdQueryVariables
> = gql`
  query securityServerChannelById($_id: String!) {
    securityServerChannelById(_id: $_id) {
      _id
      name
      enabled
      similarityThreshold
      recognitionFps
      connection {
        host
        port
        path
        username
        hasPassword
      }
      alertsCount
      deletedAt
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default SECURITY_SERVER_CHANNEL_BY_ID;
