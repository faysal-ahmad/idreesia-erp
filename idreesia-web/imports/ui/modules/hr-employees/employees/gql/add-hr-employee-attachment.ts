import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddHrEmployeeAttachmentMutation,
  AddHrEmployeeAttachmentMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_HR_EMPLOYEE_ATTACHMENT: TypedDocumentNode<
  AddHrEmployeeAttachmentMutation,
  AddHrEmployeeAttachmentMutationVariables
> = gql`
  mutation addHrEmployeeAttachment($_id: String!, $attachmentId: String!) {
    addHrEmployeeAttachment(_id: $_id, attachmentId: $attachmentId) {
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

export default ADD_HR_EMPLOYEE_ATTACHMENT;
