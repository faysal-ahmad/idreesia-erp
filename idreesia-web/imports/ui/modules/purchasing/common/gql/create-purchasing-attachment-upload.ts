import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreatePurchasingAttachmentUploadMutation,
  CreatePurchasingAttachmentUploadMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_PURCHASING_ATTACHMENT_UPLOAD: TypedDocumentNode<
  CreatePurchasingAttachmentUploadMutation,
  CreatePurchasingAttachmentUploadMutationVariables
> = gql`
  mutation createPurchasingAttachmentUpload($ownerType: String!, $ownerId: String!, $fileName: String!, $mimeType: String!, $size: Int!, $name: String) {
    createPurchasingAttachmentUpload(ownerType: $ownerType, ownerId: $ownerId, fileName: $fileName, mimeType: $mimeType, size: $size, name: $name) {
      uploadId
      url
      contentType
    }
  }
`;

export default CREATE_PURCHASING_ATTACHMENT_UPLOAD;
