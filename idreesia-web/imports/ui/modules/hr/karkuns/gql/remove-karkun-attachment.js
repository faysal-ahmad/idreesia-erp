import gql from 'graphql-tag';

const REMOVE_KARKUN_ATTACHMENT = gql`
  mutation removeKarkunAttachment($_id: String!, $attachmentId: String!) {
    removeKarkunAttachment(_id: $_id, attachmentId: $attachmentId) {
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

export default REMOVE_KARKUN_ATTACHMENT;
