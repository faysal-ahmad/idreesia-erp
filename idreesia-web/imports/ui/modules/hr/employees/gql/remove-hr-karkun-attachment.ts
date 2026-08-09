import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveHrKarkunAttachmentMutation,
  RemoveHrKarkunAttachmentMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_HR_KARKUN_ATTACHMENT: TypedDocumentNode<
  RemoveHrKarkunAttachmentMutation,
  RemoveHrKarkunAttachmentMutationVariables
> = gql`
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
