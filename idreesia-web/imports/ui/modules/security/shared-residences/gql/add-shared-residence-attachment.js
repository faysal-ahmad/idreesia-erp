import gql from 'graphql-tag';

export const ADD_SHARED_RESIDENCE_ATTACHMENT = gql`
  mutation addSharedResidenceAttachment($_id: String!, $attachmentId: String!) {
    addSharedResidenceAttachment(_id: $_id, attachmentId: $attachmentId) {
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
