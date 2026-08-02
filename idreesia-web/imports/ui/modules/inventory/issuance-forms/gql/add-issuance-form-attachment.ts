import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddIssuanceFormAttachmentMutation,
  AddIssuanceFormAttachmentMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const ADD_ISSUANCE_FORM_ATTACHMENT: TypedDocumentNode<
  AddIssuanceFormAttachmentMutation,
  AddIssuanceFormAttachmentMutationVariables
> = gql`
  mutation addIssuanceFormAttachment(
    $_id: String!
    $physicalStoreId: String!
    $attachmentId: String!
  ) {
    addIssuanceFormAttachment(
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
