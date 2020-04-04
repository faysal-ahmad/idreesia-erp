import gql from 'graphql-tag';

const ADD_ACCOUNTS_IMDAD_REQUEST_ATTACHMENT = gql`
  mutation addAccountsImdadRequestAttachment(
    $_id: String!
    $attachmentId: String!
  ) {
    addAccountsImdadRequestAttachment(_id: $_id, attachmentId: $attachmentId) {
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

export default ADD_ACCOUNTS_IMDAD_REQUEST_ATTACHMENT;
