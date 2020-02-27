import gql from 'graphql-tag';

const ADD_HR_KARKUN_ATTACHMENT = gql`
  mutation addHrKarkunAttachment($_id: String!, $attachmentId: String!) {
    addHrKarkunAttachment(_id: $_id, attachmentId: $attachmentId) {
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

export default ADD_HR_KARKUN_ATTACHMENT;
