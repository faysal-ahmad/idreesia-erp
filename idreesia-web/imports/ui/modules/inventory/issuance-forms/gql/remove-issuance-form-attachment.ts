import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveIssuanceFormAttachmentMutation,
  RemoveIssuanceFormAttachmentMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const REMOVE_ISSUANCE_FORM_ATTACHMENT: TypedDocumentNode<
  RemoveIssuanceFormAttachmentMutation,
  RemoveIssuanceFormAttachmentMutationVariables
> = gql`
  mutation removeIssuanceFormAttachment(
    $_id: String!
    $physicalStoreId: String!
    $attachmentId: String!
  ) {
    removeIssuanceFormAttachment(
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
