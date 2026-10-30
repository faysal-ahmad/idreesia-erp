import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityServerAlertSyncStatusQuery,
  SecurityServerAlertSyncStatusQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SECURITY_SERVER_ALERT_SYNC_STATUS: TypedDocumentNode<
  SecurityServerAlertSyncStatusQuery,
  SecurityServerAlertSyncStatusQueryVariables
> = gql`
  query securityServerAlertSyncStatus {
    securityServerAlertSyncStatus {
      lastSyncedAt
    }
  }
`;

export default SECURITY_SERVER_ALERT_SYNC_STATUS;
