import gql from 'graphql-tag';

const ADD_KARKUN_ATTACHMENT = gql`
  mutation addKarkunAttachment($_id: String!, $attachmentId: String!) {
    addKarkunAttachment(_id: $_id, attachmentId: $attachmentId) {
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

export default ADD_KARKUN_ATTACHMENT;
