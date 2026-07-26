import gql from 'graphql-tag';

export const REMOVE_ISSUANCE_FORM_ATTACHMENT = gql`
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
