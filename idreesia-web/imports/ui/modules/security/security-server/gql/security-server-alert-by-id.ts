import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityServerAlertByIdQuery,
  SecurityServerAlertByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SECURITY_SERVER_ALERT_BY_ID: TypedDocumentNode<
  SecurityServerAlertByIdQuery,
  SecurityServerAlertByIdQueryVariables
> = gql`
  query securityServerAlertById($_id: String!) {
    securityServerAlertById(_id: $_id) {
      _id
      externalId
      profileId
      profileName
      profileIsTest
      channelId
      channelName
      timestamp
      similarityScore
      imageUrl
      review
      reviewedAt
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default SECURITY_SERVER_ALERT_BY_ID;
