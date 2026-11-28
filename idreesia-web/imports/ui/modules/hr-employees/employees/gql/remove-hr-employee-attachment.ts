import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveHrEmployeeAttachmentMutation,
  RemoveHrEmployeeAttachmentMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_HR_EMPLOYEE_ATTACHMENT: TypedDocumentNode<
  RemoveHrEmployeeAttachmentMutation,
  RemoveHrEmployeeAttachmentMutationVariables
> = gql`
  mutation removeHrEmployeeAttachment($_id: String!, $attachmentId: String!) {
    removeHrEmployeeAttachment(_id: $_id, attachmentId: $attachmentId) {
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

export default REMOVE_HR_EMPLOYEE_ATTACHMENT;
