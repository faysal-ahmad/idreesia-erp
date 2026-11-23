import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AbortPurchasingAttachmentUploadMutation,
  AbortPurchasingAttachmentUploadMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ABORT_PURCHASING_ATTACHMENT_UPLOAD: TypedDocumentNode<
  AbortPurchasingAttachmentUploadMutation,
  AbortPurchasingAttachmentUploadMutationVariables
> = gql`
  mutation abortPurchasingAttachmentUpload($uploadId: String!) {
    abortPurchasingAttachmentUpload(uploadId: $uploadId)
  }
`;

export default ABORT_PURCHASING_ATTACHMENT_UPLOAD;
