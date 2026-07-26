import gql from 'graphql-tag';

const REMOVE_HR_KARKUN_ATTACHMENT = gql`
  mutation removeHrKarkunAttachment($_id: String!, $attachmentId: String!) {
    removeHrKarkunAttachment(_id: $_id, attachmentId: $attachmentId) {
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

export default REMOVE_HR_KARKUN_ATTACHMENT;
