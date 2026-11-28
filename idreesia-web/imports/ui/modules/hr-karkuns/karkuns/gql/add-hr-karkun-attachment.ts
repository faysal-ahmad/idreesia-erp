import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddHrKarkunAttachmentMutation,
  AddHrKarkunAttachmentMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_HR_KARKUN_ATTACHMENT: TypedDocumentNode<
  AddHrKarkunAttachmentMutation,
  AddHrKarkunAttachmentMutationVariables
> = gql`
  mutation addHrKarkunAttachment($_id: String!, $attachmentId: String!) {
    addHrKarkunAttachment(_id: $_id, attachmentId: $attachmentId) {
      _id
      karkunData {
        attachments {
          _id
          name
          description
          mimeType
        }
      }
    }
  }
`;

export default ADD_HR_KARKUN_ATTACHMENT;
