import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemovePurchaseFormAttachmentMutation,
  RemovePurchaseFormAttachmentMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const REMOVE_PURCHASE_FORM_ATTACHMENT: TypedDocumentNode<
  RemovePurchaseFormAttachmentMutation,
  RemovePurchaseFormAttachmentMutationVariables
> = gql`
  mutation removePurchaseFormAttachment(
    $_id: String!
    $physicalStoreId: String!
    $attachmentId: String!
  ) {
    removePurchaseFormAttachment(
      _id: $_id
      physicalStoreId: $physicalStoreId
      attachmentId: $attachmentId
    ) {
      _id
      attachments {
        _id
        name
        description
        mimeType
      }
    }
  }
`;
