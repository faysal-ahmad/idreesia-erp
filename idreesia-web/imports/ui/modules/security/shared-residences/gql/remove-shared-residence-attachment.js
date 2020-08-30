import gql from 'graphql-tag';

export const REMOVE_SHARED_RESIDENCE_ATTACHMENT = gql`
  mutation removeSharedResidenceAttachment(
    $_id: String!
    $attachmentId: String!
  ) {
    removeSharedResidenceAttachment(_id: $_id, attachmentId: $attachmentId) {
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
