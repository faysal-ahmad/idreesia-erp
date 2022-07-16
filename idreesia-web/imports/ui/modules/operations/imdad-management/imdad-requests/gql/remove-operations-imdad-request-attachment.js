import gql from 'graphql-tag';

const REMOVE_OPERATIONS_IMDAD_REQUEST_ATTACHMENT = gql`
  mutation removeOperationsImdadRequestAttachment(
    $_id: String!
    $attachmentId: String!
  ) {
    removeOperationsImdadRequestAttachment(
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

export default REMOVE_OPERATIONS_IMDAD_REQUEST_ATTACHMENT;
