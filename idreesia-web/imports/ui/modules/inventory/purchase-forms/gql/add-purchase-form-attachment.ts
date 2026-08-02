import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddPurchaseFormAttachmentMutation,
  AddPurchaseFormAttachmentMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const ADD_PURCHASE_FORM_ATTACHMENT: TypedDocumentNode<
  AddPurchaseFormAttachmentMutation,
  AddPurchaseFormAttachmentMutationVariables
> = gql`
  mutation addPurchaseFormAttachment(
    $_id: String!
    $physicalStoreId: String!
    $attachmentId: String!
  ) {
    addPurchaseFormAttachment(
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
