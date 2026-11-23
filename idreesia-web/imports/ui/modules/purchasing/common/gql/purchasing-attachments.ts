import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PurchasingAttachmentsQuery,
  PurchasingAttachmentsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PURCHASING_ATTACHMENTS: TypedDocumentNode<
  PurchasingAttachmentsQuery,
  PurchasingAttachmentsQueryVariables
> = gql`
  query purchasingAttachments($ownerType: String!, $ownerId: String!) {
    purchasingAttachments(ownerType: $ownerType, ownerId: $ownerId) {
      _id
      name
      fileName
      mimeType
      size
      createdAt
      createdBy
    }
  }
`;

export default PURCHASING_ATTACHMENTS;
