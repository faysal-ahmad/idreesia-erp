import gql from 'graphql-tag';

export const REMOVE_PURCHASE_FORM_ATTACHMENT = gql`
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
