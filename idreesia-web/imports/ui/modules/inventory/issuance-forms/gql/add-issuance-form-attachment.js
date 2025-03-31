import gql from 'graphql-tag';

export const ADD_ISSUANCE_FORM_ATTACHMENT = gql`
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
