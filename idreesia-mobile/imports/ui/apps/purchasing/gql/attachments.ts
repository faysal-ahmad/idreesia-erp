import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobilePurchasingAbortAttachmentUploadMutation,
  MobilePurchasingAbortAttachmentUploadMutationVariables,
  MobilePurchasingAttachmentDownloadQuery,
  MobilePurchasingAttachmentDownloadQueryVariables,
  MobilePurchasingAttachmentsQuery,
  MobilePurchasingAttachmentsQueryVariables,
  MobilePurchasingCompleteAttachmentUploadMutation,
  MobilePurchasingCompleteAttachmentUploadMutationVariables,
  MobilePurchasingCreateAttachmentUploadMutation,
  MobilePurchasingCreateAttachmentUploadMutationVariables,
  MobilePurchasingDeleteAttachmentMutation,
  MobilePurchasingDeleteAttachmentMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const MOBILE_PURCHASING_ATTACHMENTS: TypedDocumentNode<
  MobilePurchasingAttachmentsQuery,
  MobilePurchasingAttachmentsQueryVariables
> = gql`
  query mobilePurchasingAttachments($ownerType: String!, $ownerId: String!) {
    purchasingAttachments(ownerType: $ownerType, ownerId: $ownerId) {
      _id
      name
      fileName
      mimeType
      size
      createdAt
    }
  }
`;

export const MOBILE_PURCHASING_ATTACHMENT_DOWNLOAD: TypedDocumentNode<
  MobilePurchasingAttachmentDownloadQuery,
  MobilePurchasingAttachmentDownloadQueryVariables
> = gql`
  query mobilePurchasingAttachmentDownload($_id: String!, $inline: Boolean) {
    purchasingAttachmentDownload(_id: $_id, inline: $inline) {
      url
      fileName
      mimeType
    }
  }
`;

export const MOBILE_PURCHASING_CREATE_ATTACHMENT_UPLOAD: TypedDocumentNode<
  MobilePurchasingCreateAttachmentUploadMutation,
  MobilePurchasingCreateAttachmentUploadMutationVariables
> = gql`
  mutation mobilePurchasingCreateAttachmentUpload(
    $ownerType: String!
    $ownerId: String!
    $fileName: String!
    $mimeType: String!
    $size: Int!
    $name: String
  ) {
    createPurchasingAttachmentUpload(
      ownerType: $ownerType
      ownerId: $ownerId
      fileName: $fileName
      mimeType: $mimeType
      size: $size
      name: $name
    ) {
      uploadId
      url
      contentType
    }
  }
`;

export const MOBILE_PURCHASING_COMPLETE_ATTACHMENT_UPLOAD: TypedDocumentNode<
  MobilePurchasingCompleteAttachmentUploadMutation,
  MobilePurchasingCompleteAttachmentUploadMutationVariables
> = gql`
  mutation mobilePurchasingCompleteAttachmentUpload($uploadId: String!) {
    completePurchasingAttachmentUpload(uploadId: $uploadId) {
      _id
    }
  }
`;

export const MOBILE_PURCHASING_ABORT_ATTACHMENT_UPLOAD: TypedDocumentNode<
  MobilePurchasingAbortAttachmentUploadMutation,
  MobilePurchasingAbortAttachmentUploadMutationVariables
> = gql`
  mutation mobilePurchasingAbortAttachmentUpload($uploadId: String!) {
    abortPurchasingAttachmentUpload(uploadId: $uploadId)
  }
`;

export const MOBILE_PURCHASING_DELETE_ATTACHMENT: TypedDocumentNode<
  MobilePurchasingDeleteAttachmentMutation,
  MobilePurchasingDeleteAttachmentMutationVariables
> = gql`
  mutation mobilePurchasingDeleteAttachment($_id: String!) {
    deletePurchasingAttachment(_id: $_id)
  }
`;
