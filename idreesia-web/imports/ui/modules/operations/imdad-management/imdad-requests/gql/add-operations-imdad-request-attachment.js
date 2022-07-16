import gql from 'graphql-tag';

const ADD_OPERATIONS_IMDAD_REQUEST_ATTACHMENT = gql`
  mutation addOperationsImdadRequestAttachment(
    $_id: String!
    $attachmentId: String!
  ) {
    addOperationsImdadRequestAttachment(
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

export default ADD_OPERATIONS_IMDAD_REQUEST_ATTACHMENT;
