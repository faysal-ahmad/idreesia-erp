import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CompletePurchasingAttachmentUploadMutation,
  CompletePurchasingAttachmentUploadMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const COMPLETE_PURCHASING_ATTACHMENT_UPLOAD: TypedDocumentNode<
  CompletePurchasingAttachmentUploadMutation,
  CompletePurchasingAttachmentUploadMutationVariables
> = gql`
  mutation completePurchasingAttachmentUpload($uploadId: String!) {
    completePurchasingAttachmentUpload(uploadId: $uploadId) {
      _id
    }
  }
`;

export default COMPLETE_PURCHASING_ATTACHMENT_UPLOAD;
