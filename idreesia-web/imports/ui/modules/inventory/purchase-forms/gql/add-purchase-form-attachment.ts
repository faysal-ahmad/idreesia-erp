import gql from 'graphql-tag';

export const ADD_PURCHASE_FORM_ATTACHMENT = gql`
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
