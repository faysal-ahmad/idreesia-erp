import gql from 'graphql-tag';

const REMOVE_ACCOUNTS_IMDAD_REQUEST_ATTACHMENT = gql`
  mutation removeAccountsImdadRequestAttachment(
    $_id: String!
    $attachmentId: String!
  ) {
    removeAccountsImdadRequestAttachment(
      _id: $_id
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

export default REMOVE_ACCOUNTS_IMDAD_REQUEST_ATTACHMENT;
