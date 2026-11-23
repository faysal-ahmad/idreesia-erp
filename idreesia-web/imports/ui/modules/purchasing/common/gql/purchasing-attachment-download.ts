import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PurchasingAttachmentDownloadQuery,
  PurchasingAttachmentDownloadQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PURCHASING_ATTACHMENT_DOWNLOAD: TypedDocumentNode<
  PurchasingAttachmentDownloadQuery,
  PurchasingAttachmentDownloadQueryVariables
> = gql`
  query purchasingAttachmentDownload($_id: String!, $inline: Boolean) {
    purchasingAttachmentDownload(_id: $_id, inline: $inline) {
      url
      fileName
      mimeType
    }
  }
`;

export default PURCHASING_ATTACHMENT_DOWNLOAD;
