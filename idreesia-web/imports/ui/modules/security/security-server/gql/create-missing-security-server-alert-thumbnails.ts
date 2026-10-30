import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateMissingSecurityServerAlertThumbnailsMutation,
  CreateMissingSecurityServerAlertThumbnailsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_MISSING_SECURITY_SERVER_ALERT_THUMBNAILS: TypedDocumentNode<
  CreateMissingSecurityServerAlertThumbnailsMutation,
  CreateMissingSecurityServerAlertThumbnailsMutationVariables
> = gql`
  mutation createMissingSecurityServerAlertThumbnails {
    createMissingSecurityServerAlertThumbnails
  }
`;

export default CREATE_MISSING_SECURITY_SERVER_ALERT_THUMBNAILS;
